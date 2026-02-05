/**
 * SolForge Client - Anchor program wrapper
 * @module @solforge/sdk
 */

import {
  Connection,
  PublicKey,
  SystemProgram,
  Keypair,
  GetProgramAccountsFilter,
} from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, BN } from '@coral-xyz/anchor';
import * as IDL from '../../target/idl/solforge.json';
import {
  SOLFORGE_PROGRAM_ID,
  RPC_ENDPOINTS,
} from './constants';
import {
  findProtocolStatePda,
  findBuildRequestPda,
  findEscrowPda,
  findBuilderProfilePda,
  findBuildStepPda,
} from './pda';
import type {
  SolForgeClientConfig,
  InitializeOptions,
  RegisterBuilderOptions,
  RequestBuildOptions,
  ClaimBuildOptions,
  LogBuildStepOptions,
  CompleteBuildOptions,
  GetAllBuildsFilter,
  ProtocolState,
  BuildRequest,
  BuilderProfile,
  BuildStep,
} from './types';

export class SolForgeClient {
  readonly connection: Connection;
  readonly program: Program;
  readonly programId: PublicKey;

  constructor(config?: SolForgeClientConfig) {
    const rpcUrl = config?.rpcUrl || RPC_ENDPOINTS.devnet;
    const commitment = config?.commitment || 'confirmed';
    this.programId = config?.programId || SOLFORGE_PROGRAM_ID;

    this.connection = new Connection(rpcUrl, commitment);

    // Create a dummy provider for read-only operations
    const wallet = new Wallet(Keypair.generate());
    const provider = new AnchorProvider(this.connection, wallet, { commitment });
    this.program = new Program(IDL as any, provider);
  }

  /**
   * Initialize the protocol
   * @param options Initialize options
   * @returns Transaction signature
   */
  async initialize(options: InitializeOptions): Promise<string> {
    const { admin, feeBps } = options;

    if (feeBps < 0 || feeBps > 10000) {
      throw new Error('feeBps must be between 0 and 10000');
    }

    const [protocolStatePda] = findProtocolStatePda();

    const tx = await this.program.methods
      .initialize(feeBps)
      .accounts({
        protocolState: protocolStatePda,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([admin])
      .rpc();

    return tx;
  }

  /**
   * Register a builder
   * @param options Register builder options
   * @returns Transaction signature
   */
  async registerBuilder(options: RegisterBuilderOptions): Promise<string> {
    const { admin, builderAuthority } = options;

    const [protocolStatePda] = findProtocolStatePda();
    const [builderProfilePda] = findBuilderProfilePda(builderAuthority);

    const tx = await this.program.methods
      .registerBuilder()
      .accounts({
        protocolState: protocolStatePda,
        builderProfile: builderProfilePda,
        builderAuthority,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([admin])
      .rpc();

    return tx;
  }

  /**
   * Request a build
   * @param options Request build options
   * @returns Transaction signature and build request PDA
   */
  async requestBuild(options: RequestBuildOptions): Promise<{
    signature: string;
    buildRequestPda: PublicKey;
    buildId: BN;
  }> {
    const { requester, spec, budgetLamports } = options;

    if (spec.length > 500) {
      throw new Error('Spec cannot exceed 500 characters');
    }

    const [protocolStatePda] = findProtocolStatePda();
    const protocolState = await this.getProtocolState();
    const buildId = protocolState.buildCount;

    const [buildRequestPda] = findBuildRequestPda(requester.publicKey, buildId);
    const [escrowPda] = findEscrowPda(buildRequestPda);

    const budget = typeof budgetLamports === 'number' ? new BN(budgetLamports) : budgetLamports;

    const tx = await this.program.methods
      .requestBuild(spec, budget)
      .accounts({
        protocolState: protocolStatePda,
        buildRequest: buildRequestPda,
        escrow: escrowPda,
        requester: requester.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([requester])
      .rpc();

    return {
      signature: tx,
      buildRequestPda,
      buildId,
    };
  }

  /**
   * Claim a build
   * @param options Claim build options
   * @returns Transaction signature
   */
  async claimBuild(options: ClaimBuildOptions): Promise<string> {
    const { builder, buildRequestPda } = options;

    const [builderProfilePda] = findBuilderProfilePda(builder.publicKey);

    const tx = await this.program.methods
      .claimBuild()
      .accounts({
        buildRequest: buildRequestPda,
        builderProfile: builderProfilePda,
        builder: builder.publicKey,
      })
      .signers([builder])
      .rpc();

    return tx;
  }

  /**
   * Log a build step
   * @param options Log build step options
   * @returns Transaction signature
   */
  async logBuildStep(options: LogBuildStepOptions): Promise<string> {
    const { builder, buildRequestPda, stepType, description, contentHash } = options;

    if (description.length > 200) {
      throw new Error('Description cannot exceed 200 characters');
    }

    const buildRequest = await this.getBuildRequest(buildRequestPda);
    const [buildStepPda] = findBuildStepPda(buildRequestPda, buildRequest.stepCount);

    // Convert contentHash to array if it's a Buffer
    const hashArray = Buffer.isBuffer(contentHash) 
      ? Array.from(contentHash) 
      : contentHash;

    if (hashArray.length !== 32) {
      throw new Error('Content hash must be exactly 32 bytes');
    }

    const tx = await this.program.methods
      .logBuildStep(stepType as any, description, hashArray as any)
      .accounts({
        buildRequest: buildRequestPda,
        buildStep: buildStepPda,
        builder: builder.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([builder])
      .rpc();

    return tx;
  }

  /**
   * Complete a build
   * @param options Complete build options
   * @returns Transaction signature
   */
  async completeBuild(options: CompleteBuildOptions): Promise<string> {
    const { builder, buildRequestPda, programId, success } = options;

    if (programId && programId.length > 50) {
      throw new Error('Program ID cannot exceed 50 characters');
    }

    const buildRequest = await this.getBuildRequest(buildRequestPda);
    const [protocolStatePda] = findProtocolStatePda();
    const [builderProfilePda] = findBuilderProfilePda(builder.publicKey);
    const [escrowPda] = findEscrowPda(buildRequestPda);

    const protocolState = await this.getProtocolState();

    const tx = await this.program.methods
      .completeBuild(programId || null, success)
      .accounts({
        protocolState: protocolStatePda,
        buildRequest: buildRequestPda,
        builderProfile: builderProfilePda,
        escrow: escrowPda,
        builder: builder.publicKey,
        requester: buildRequest.requester,
        admin: protocolState.admin,
        systemProgram: SystemProgram.programId,
      })
      .signers([builder])
      .rpc();

    return tx;
  }

  /**
   * Get a build request account
   * @param buildRequestPda Build request PDA
   * @returns Build request account data
   */
  async getBuildRequest(buildRequestPda: PublicKey): Promise<BuildRequest> {
    const accountInfo = await this.connection.getAccountInfo(buildRequestPda);
    if (!accountInfo) {
      throw new Error('Build request account not found');
    }
    const account = this.program.coder.accounts.decode('buildRequest', accountInfo.data);
    return account as any;
  }

  /**
   * Get protocol state
   * @returns Protocol state account data
   */
  async getProtocolState(): Promise<ProtocolState> {
    const [protocolStatePda] = findProtocolStatePda();
    const accountInfo = await this.connection.getAccountInfo(protocolStatePda);
    if (!accountInfo) {
      throw new Error('Protocol state account not found');
    }
    const account = this.program.coder.accounts.decode('protocolState', accountInfo.data);
    return account as any;
  }

  /**
   * Get builder profile
   * @param builderAuthority Builder authority public key
   * @returns Builder profile account data
   */
  async getBuilderProfile(builderAuthority: PublicKey): Promise<BuilderProfile> {
    const [builderProfilePda] = findBuilderProfilePda(builderAuthority);
    const accountInfo = await this.connection.getAccountInfo(builderProfilePda);
    if (!accountInfo) {
      throw new Error('Builder profile account not found');
    }
    const account = this.program.coder.accounts.decode('builderProfile', accountInfo.data);
    return account as any;
  }

  /**
   * Get a build step
   * @param buildRequestPda Build request PDA
   * @param stepNumber Step number (0-indexed)
   * @returns Build step account data
   */
  async getBuildStep(buildRequestPda: PublicKey, stepNumber: number): Promise<BuildStep> {
    const [buildStepPda] = findBuildStepPda(buildRequestPda, stepNumber);
    const accountInfo = await this.connection.getAccountInfo(buildStepPda);
    if (!accountInfo) {
      throw new Error('Build step account not found');
    }
    const account = this.program.coder.accounts.decode('buildStep', accountInfo.data);
    return account as any;
  }

  /**
   * Get all builds (optionally filtered)
   * @param filter Optional filter criteria
   * @returns Array of build requests with their PDAs
   */
  async getAllBuilds(filter?: GetAllBuildsFilter): Promise<Array<{
    pubkey: PublicKey;
    account: BuildRequest;
  }>> {
    const filters: GetProgramAccountsFilter[] = [];

    // Account discriminator for BuildRequest (first 8 bytes)
    filters.push({
      memcmp: {
        offset: 0,
        bytes: 'B9DwfXMZjwo', // Base58 of discriminator [7, 206, 240, 125, 25, 143, 138, 146]
      },
    });

    // Filter by requester (pubkey is at offset 8+8 = 16, after discriminator + id)
    if (filter?.requester) {
      filters.push({
        memcmp: {
          offset: 16,
          bytes: filter.requester.toBase58(),
        },
      });
    }

    // Filter by builder (pubkey is at offset 8+8+32 = 48, after discriminator + id + requester)
    // Note: This is an Option<Pubkey>, so we need to check if it's Some (first byte = 1)
    if (filter?.builder) {
      filters.push({
        memcmp: {
          offset: 49, // Skip the Option discriminator byte
          bytes: filter.builder.toBase58(),
        },
      });
    }

    const accounts = await this.connection.getProgramAccounts(this.programId, {
      filters,
    });

    // Deserialize accounts
    const buildRequests = accounts.map(({ pubkey, account }) => ({
      pubkey,
      account: this.program.coder.accounts.decode('buildRequest', account.data) as any,
    }));

    // Apply status filter if provided (can't be done at RPC level)
    if (filter?.status) {
      const statusKey = Object.keys(filter.status)[0];
      return buildRequests.filter((br) => Object.keys(br.account.status)[0] === statusKey);
    }

    return buildRequests;
  }

  /**
   * Stream build progress from the engine (SSE)
   * This is a convenience method for connecting to the build engine's SSE endpoint
   * @param engineUrl The build engine's base URL
   * @param spec The build specification
   * @yields Build events as they occur
   */
  async *streamBuild(engineUrl: string, spec: string): AsyncGenerator<{
    type: string;
    data: any;
  }> {
    const url = `${engineUrl}/build/stream`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({ spec }),
    });

    if (!response.ok) {
      throw new Error(`Failed to start build stream: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              yield data;
            } catch (e) {
              console.warn('Failed to parse SSE data:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
