/**
 * SolForge SDK
 * Anchor-based SDK for the SolForge autonomous program compiler
 * @module @solforge/sdk
 */

// Main client
export { SolForgeClient } from './client';

// PDA helpers
export {
  findProtocolStatePda,
  findBuildRequestPda,
  findEscrowPda,
  findBuilderProfilePda,
  findBuildStepPda,
} from './pda';

// Constants
export {
  SOLFORGE_PROGRAM_ID,
  SEEDS,
  BuildStatus,
  StepType,
  RPC_ENDPOINTS,
} from './constants';

// Types
export type {
  BuildStatusVariant,
  StepTypeVariant,
  ProtocolState,
  BuildRequest,
  BuilderProfile,
  BuildStep,
  SolForgeClientConfig,
  InitializeOptions,
  RegisterBuilderOptions,
  RequestBuildOptions,
  ClaimBuildOptions,
  LogBuildStepOptions,
  CompleteBuildOptions,
  GetAllBuildsFilter,
  StreamBuildEvent,
} from './types';

export { SolForgeError } from './types';
