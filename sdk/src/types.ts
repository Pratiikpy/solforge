/**
 * SolForge SDK Types
 * @module @solforge/sdk
 */

import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

/** Build status variants */
export type BuildStatusVariant = 
  | { pending: {} }
  | { inProgress: {} }
  | { completed: {} }
  | { failed: {} };

/** Step type variants */
export type StepTypeVariant = 
  | { analyze: {} }
  | { generateCode: {} }
  | { compile: {} }
  | { test: {} }
  | { deploy: {} }
  | { generateSdk: {} }
  | { document: {} };

/** Protocol state account */
export interface ProtocolState {
  admin: PublicKey;
  feeBps: number;
  buildCount: BN;
  totalBuildsCompleted: BN;
  totalSolEarned: BN;
  bump: number;
}

/** Build request account */
export interface BuildRequest {
  id: BN;
  requester: PublicKey;
  builder: PublicKey | null;
  spec: string;
  budget: BN;
  status: BuildStatusVariant;
  createdAt: BN;
  completedAt: BN;
  deployedProgramId: string | null;
  stepCount: number;
  bump: number;
}

/** Builder profile account */
export interface BuilderProfile {
  authority: PublicKey;
  buildsCompleted: BN;
  buildsFailed: BN;
  totalEarned: BN;
  registeredAt: BN;
  active: boolean;
  bump: number;
}

/** Build step account */
export interface BuildStep {
  buildId: BN;
  stepNumber: number;
  stepType: StepTypeVariant;
  description: string;
  contentHash: number[];
  timestamp: BN;
}

/** Client configuration */
export interface SolForgeClientConfig {
  /** RPC endpoint URL */
  rpcUrl?: string;
  /** Commitment level */
  commitment?: 'processed' | 'confirmed' | 'finalized';
  /** Program ID (defaults to devnet deployment) */
  programId?: PublicKey;
}

/** Initialize options */
export interface InitializeOptions {
  /** Admin keypair */
  admin: any; // Keypair type
  /** Protocol fee in basis points (0-10000) */
  feeBps: number;
}

/** Register builder options */
export interface RegisterBuilderOptions {
  /** Admin keypair */
  admin: any; // Keypair type
  /** Builder authority public key */
  builderAuthority: PublicKey;
}

/** Request build options */
export interface RequestBuildOptions {
  /** Requester keypair */
  requester: any; // Keypair type
  /** Build specification (max 500 chars) */
  spec: string;
  /** Budget in lamports */
  budgetLamports: BN | number;
}

/** Claim build options */
export interface ClaimBuildOptions {
  /** Builder keypair */
  builder: any; // Keypair type
  /** Build request PDA */
  buildRequestPda: PublicKey;
}

/** Log build step options */
export interface LogBuildStepOptions {
  /** Builder keypair */
  builder: any; // Keypair type
  /** Build request PDA */
  buildRequestPda: PublicKey;
  /** Step type */
  stepType: StepTypeVariant;
  /** Step description (max 200 chars) */
  description: string;
  /** Content hash (32 bytes) */
  contentHash: Buffer | number[];
}

/** Complete build options */
export interface CompleteBuildOptions {
  /** Builder keypair */
  builder: any; // Keypair type
  /** Build request PDA */
  buildRequestPda: PublicKey;
  /** Deployed program ID (if successful) */
  programId?: string;
  /** Whether the build succeeded */
  success: boolean;
}

/** Get all builds filter */
export interface GetAllBuildsFilter {
  /** Filter by requester */
  requester?: PublicKey;
  /** Filter by builder */
  builder?: PublicKey;
  /** Filter by status */
  status?: BuildStatusVariant;
}

/** Stream build event */
export interface StreamBuildEvent {
  type: 'step' | 'complete' | 'error';
  data: any;
  timestamp: string;
}

/** SolForge error */
export class SolForgeError extends Error {
  constructor(
    message: string,
    public code?: number,
    public logs?: string[]
  ) {
    super(message);
    this.name = 'SolForgeError';
  }
}
