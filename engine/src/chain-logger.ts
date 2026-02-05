import { Connection, PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { Program, AnchorProvider, Wallet, BN, Idl } from '@coral-xyz/anchor';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Use 'any' typed program to avoid IDL generics issues with Anchor 0.32+
type AnyProgram = Program<any>;

const PROGRAM_ID = new PublicKey('G45nBxWsUgxZsu9YTEt9QqHEsxtdc495xqnTR5SRwUAC');
const DEPLOY_KEY_PATH = path.resolve(__dirname, '../../deploy-key.json');
const IDL_PATH = path.resolve(__dirname, '../../target/idl/solforge.json');
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const BUILD_BUDGET = 0.01 * LAMPORTS_PER_SOL; // 0.01 SOL per build

// Step type mapping matching the Anchor program
const STEP_TYPES = {
  analyze: { analyze: {} },
  generateCode: { generateCode: {} },
  compile: { compile: {} },
  test: { test: {} },
  deploy: { deploy: {} },
  generateSdk: { generateSdk: {} },
  document: { document: {} },
} as const;

type StepName = keyof typeof STEP_TYPES;

export interface ChainLogResult {
  txSignature: string;
  explorerUrl: string;
}

export interface BuildChainLogger {
  requestBuild(spec: string): Promise<ChainLogResult | null>;
  claimBuild(): Promise<ChainLogResult | null>;
  logStep(stepName: StepName, description: string, content: string): Promise<ChainLogResult | null>;
  completeBuild(programId: string | null, success: boolean): Promise<ChainLogResult | null>;
  getBuildRequestPda(): PublicKey | null;
}

let program: AnyProgram | null = null;
let wallet: Keypair | null = null;
let provider: AnchorProvider | null = null;
let protocolInitialized = false;
let builderRegistered = false;

function loadProgram(): AnyProgram | null {
  if (program) return program;
  
  try {
    if (!fs.existsSync(DEPLOY_KEY_PATH)) {
      console.warn('[chain-logger] Deploy key not found at', DEPLOY_KEY_PATH);
      return null;
    }
    if (!fs.existsSync(IDL_PATH)) {
      console.warn('[chain-logger] IDL not found at', IDL_PATH);
      return null;
    }

    const keyData = JSON.parse(fs.readFileSync(DEPLOY_KEY_PATH, 'utf-8'));
    wallet = Keypair.fromSecretKey(Uint8Array.from(keyData));
    
    const connection = new Connection(RPC_URL, 'confirmed');
    const anchorWallet = new Wallet(wallet);
    provider = new AnchorProvider(connection, anchorWallet, {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    });

    const idl = JSON.parse(fs.readFileSync(IDL_PATH, 'utf-8'));
    program = new Program(idl, provider);
    
    console.log('[chain-logger] ✅ Loaded program:', PROGRAM_ID.toBase58());
    console.log('[chain-logger] ✅ Wallet:', wallet.publicKey.toBase58());
    return program;
  } catch (err: any) {
    console.warn('[chain-logger] Failed to load program:', err.message);
    return null;
  }
}

function sha256(content: string): number[] {
  const hash = crypto.createHash('sha256').update(content).digest();
  return Array.from(hash);
}

function explorerUrl(sig: string): string {
  return `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
}

function findProtocolStatePda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('protocol')],
    PROGRAM_ID
  );
}

function findBuilderProfilePda(authority: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('builder'), authority.toBuffer()],
    PROGRAM_ID
  );
}

function findBuildRequestPda(requester: PublicKey, buildCount: BN): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('build'),
      requester.toBuffer(),
      buildCount.toArrayLike(Buffer, 'le', 8),
    ],
    PROGRAM_ID
  );
}

function findEscrowPda(buildRequestPda: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('escrow'), buildRequestPda.toBuffer()],
    PROGRAM_ID
  );
}

function findBuildStepPda(buildRequestPda: PublicKey, stepCount: number): [PublicKey, number] {
  const stepBuffer = Buffer.alloc(4);
  stepBuffer.writeUInt32LE(stepCount);
  return PublicKey.findProgramAddressSync(
    [Buffer.from('step'), buildRequestPda.toBuffer(), stepBuffer],
    PROGRAM_ID
  );
}

async function ensureProtocolInitialized(): Promise<boolean> {
  if (protocolInitialized) return true;
  
  const prog = loadProgram();
  if (!prog || !wallet) return false;
  
  const [protocolStatePda] = findProtocolStatePda();
  
  try {
    // Check if already initialized
    await (prog.account as any).protocolState.fetch(protocolStatePda);
    protocolInitialized = true;
    console.log('[chain-logger] ✅ Protocol already initialized');
    return true;
  } catch {
    // Not initialized yet — initialize it
    try {
      const tx = await prog.methods
        .initialize(250) // 2.5% fee
        .accountsStrict({
          protocolState: protocolStatePda,
          admin: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([wallet])
        .rpc();
      
      protocolInitialized = true;
      console.log('[chain-logger] ✅ Protocol initialized:', explorerUrl(tx));
      return true;
    } catch (err: any) {
      console.warn('[chain-logger] Protocol init failed:', err.message);
      return false;
    }
  }
}

async function ensureBuilderRegistered(): Promise<boolean> {
  if (builderRegistered) return true;
  
  const prog = loadProgram();
  if (!prog || !wallet) return false;
  
  const [protocolStatePda] = findProtocolStatePda();
  const [builderProfilePda] = findBuilderProfilePda(wallet.publicKey);
  
  try {
    await (prog.account as any).builderProfile.fetch(builderProfilePda);
    builderRegistered = true;
    console.log('[chain-logger] ✅ Builder already registered');
    return true;
  } catch {
    try {
      const tx = await prog.methods
        .registerBuilder()
        .accountsStrict({
          protocolState: protocolStatePda,
          builderProfile: builderProfilePda,
          builderAuthority: wallet.publicKey,
          admin: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([wallet])
        .rpc();
      
      builderRegistered = true;
      console.log('[chain-logger] ✅ Builder registered:', explorerUrl(tx));
      return true;
    } catch (err: any) {
      console.warn('[chain-logger] Builder registration failed:', err.message);
      return false;
    }
  }
}

/**
 * Create a BuildChainLogger for a single build lifecycle.
 * Handles: request → claim → log steps → complete
 * All errors are non-fatal — build continues even if on-chain logging fails.
 */
export function createBuildLogger(): BuildChainLogger {
  let buildRequestPda: PublicKey | null = null;
  let buildId: BN | null = null;

  return {
    getBuildRequestPda() {
      return buildRequestPda;
    },

    async requestBuild(spec: string): Promise<ChainLogResult | null> {
      try {
        const prog = loadProgram();
        if (!prog || !wallet) return null;

        await ensureProtocolInitialized();
        await ensureBuilderRegistered();

        const [protocolStatePda] = findProtocolStatePda();
        const protocolState = await (prog.account as any).protocolState.fetch(protocolStatePda);
        const buildCount = protocolState.buildCount as BN;
        buildId = buildCount;

        // Truncate spec to 500 chars (program limit)
        const truncatedSpec = spec.substring(0, 500);

        const [brPda] = findBuildRequestPda(wallet.publicKey, buildCount);
        const [escrowPda] = findEscrowPda(brPda);
        buildRequestPda = brPda;

        const tx = await prog.methods
          .requestBuild(truncatedSpec, new BN(BUILD_BUDGET))
          .accountsStrict({
            protocolState: protocolStatePda,
            buildRequest: brPda,
            escrow: escrowPda,
            requester: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([wallet])
          .rpc();

        console.log('[chain-logger] ✅ Build requested on-chain:', explorerUrl(tx));
        return { txSignature: tx, explorerUrl: explorerUrl(tx) };
      } catch (err: any) {
        console.warn('[chain-logger] ⚠️ requestBuild failed (continuing):', err.message);
        return null;
      }
    },

    async claimBuild(): Promise<ChainLogResult | null> {
      try {
        const prog = loadProgram();
        if (!prog || !wallet || !buildRequestPda) return null;

        const [builderProfilePda] = findBuilderProfilePda(wallet.publicKey);

        const tx = await prog.methods
          .claimBuild()
          .accountsStrict({
            buildRequest: buildRequestPda,
            builderProfile: builderProfilePda,
            builder: wallet.publicKey,
          })
          .signers([wallet])
          .rpc();

        console.log('[chain-logger] ✅ Build claimed:', explorerUrl(tx));
        return { txSignature: tx, explorerUrl: explorerUrl(tx) };
      } catch (err: any) {
        console.warn('[chain-logger] ⚠️ claimBuild failed (continuing):', err.message);
        return null;
      }
    },

    async logStep(stepName: StepName, description: string, content: string): Promise<ChainLogResult | null> {
      try {
        const prog = loadProgram();
        if (!prog || !wallet || !buildRequestPda) return null;

        // Get current step count from the build request
        const buildRequest = await (prog.account as any).buildRequest.fetch(buildRequestPda);
        const stepCount = (buildRequest as any).stepCount as number;

        const [buildStepPda] = findBuildStepPda(buildRequestPda, stepCount);
        const contentHash = sha256(content);
        const truncatedDesc = description.substring(0, 200);

        const stepType = STEP_TYPES[stepName] || STEP_TYPES.analyze;

        const tx = await prog.methods
          .logBuildStep(stepType, truncatedDesc, contentHash)
          .accountsStrict({
            buildRequest: buildRequestPda,
            buildStep: buildStepPda,
            builder: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([wallet])
          .rpc();

        console.log(`[chain-logger] ✅ Step "${stepName}" logged:`, explorerUrl(tx));
        return { txSignature: tx, explorerUrl: explorerUrl(tx) };
      } catch (err: any) {
        console.warn(`[chain-logger] ⚠️ logStep "${stepName}" failed (continuing):`, err.message);
        return null;
      }
    },

    async completeBuild(programId: string | null, success: boolean): Promise<ChainLogResult | null> {
      try {
        const prog = loadProgram();
        if (!prog || !wallet || !buildRequestPda) return null;

        const [protocolStatePda] = findProtocolStatePda();
        const [builderProfilePda] = findBuilderProfilePda(wallet.publicKey);
        const [escrowPda] = findEscrowPda(buildRequestPda);

        // For now, admin and requester are both our wallet
        const tx = await prog.methods
          .completeBuild(programId || null, success)
          .accountsStrict({
            protocolState: protocolStatePda,
            buildRequest: buildRequestPda,
            builderProfile: builderProfilePda,
            escrow: escrowPda,
            builder: wallet.publicKey,
            requester: wallet.publicKey,
            admin: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([wallet])
          .rpc();

        const status = success ? 'completed' : 'failed';
        console.log(`[chain-logger] ✅ Build ${status}:`, explorerUrl(tx));
        return { txSignature: tx, explorerUrl: explorerUrl(tx) };
      } catch (err: any) {
        console.warn('[chain-logger] ⚠️ completeBuild failed (continuing):', err.message);
        return null;
      }
    },
  };
}

// Legacy exports for backward compatibility
export interface BuildLog {
  buildId: string;
  step: string;
  status: 'success' | 'failure';
  timestamp: number;
  metadata?: any;
}

export async function logBuildStep(log: BuildLog): Promise<void> {
  console.log('[chain-logger] Legacy log:', log.step, log.status);
}

export async function logBuildStart(buildId: string, spec: string): Promise<void> {
  console.log('[chain-logger] Build start:', buildId);
}

export async function logBuildComplete(buildId: string, programId: string, programName: string): Promise<void> {
  console.log('[chain-logger] Build complete:', buildId, programId);
}

export async function logBuildError(buildId: string, step: string, error: string): Promise<void> {
  console.log('[chain-logger] Build error:', buildId, step, error);
}
