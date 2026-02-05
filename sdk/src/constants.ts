/**
 * SolForge SDK Constants
 * @module @solforge/sdk
 */

/** Default API endpoint */
export const DEFAULT_ENDPOINT = 'https://solforge.dev/api';

/** Default request timeout (30 seconds) */
export const DEFAULT_TIMEOUT = 30000;

/** Default build budget in SOL */
export const DEFAULT_BUILD_BUDGET = 0.1;

/** SolForge program ID (placeholder - will be updated on deployment) */
export const SOLFORGE_PROGRAM_ID = 'PLACEHOLDER_PROGRAM_ID';

/** Default network */
export const DEFAULT_NETWORK = 'devnet';

/** Solana Explorer base URLs */
export const EXPLORER_URLS = {
  devnet: 'https://explorer.solana.com',
  'mainnet-beta': 'https://explorer.solana.com',
};

/** Build step names */
export const BUILD_STEPS = [
  'Analyzing specification',
  'Generating program code',
  'Creating tests',
  'Compiling program',
  'Running tests',
  'Deploying to network',
  'Verifying deployment',
  'Finalizing build',
] as const;

/** SSE reconnection settings */
export const SSE_CONFIG = {
  reconnectDelay: 3000,
  maxRetries: 5,
};
