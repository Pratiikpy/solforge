/**
 * SolForge SDK Constants
 * @module @solforge/sdk
 */

import { PublicKey } from '@solana/web3.js';

/** SolForge program ID (devnet) */
export const SOLFORGE_PROGRAM_ID = new PublicKey('G45nBxWsUgxZsu9YTEt9QqHEsxtdc495xqnTR5SRwUAC');

/** PDA seeds */
export const SEEDS = {
  PROTOCOL: Buffer.from('protocol'),
  BUILDER: Buffer.from('builder'),
  BUILD: Buffer.from('build'),
  ESCROW: Buffer.from('escrow'),
  STEP: Buffer.from('step'),
} as const;

/** Build status enum mapping */
export const BuildStatus = {
  Pending: { pending: {} },
  InProgress: { inProgress: {} },
  Completed: { completed: {} },
  Failed: { failed: {} },
} as const;

/** Step type enum mapping */
export const StepType = {
  Analyze: { analyze: {} },
  GenerateCode: { generateCode: {} },
  Compile: { compile: {} },
  Test: { test: {} },
  Deploy: { deploy: {} },
  GenerateSdk: { generateSdk: {} },
  Document: { document: {} },
} as const;

/** Default RPC endpoints */
export const RPC_ENDPOINTS = {
  devnet: 'https://api.devnet.solana.com',
  mainnet: 'https://api.mainnet-beta.solana.com',
  localhost: 'http://localhost:8899',
} as const;
