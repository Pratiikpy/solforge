"use strict";
/**
 * SolForge SDK Constants
 * @module @solforge/sdk
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSE_CONFIG = exports.BUILD_STEPS = exports.EXPLORER_URLS = exports.DEFAULT_NETWORK = exports.SOLFORGE_PROGRAM_ID = exports.DEFAULT_BUILD_BUDGET = exports.DEFAULT_TIMEOUT = exports.DEFAULT_ENDPOINT = void 0;
/** Default API endpoint */
exports.DEFAULT_ENDPOINT = 'https://solforge.dev/api';
/** Default request timeout (30 seconds) */
exports.DEFAULT_TIMEOUT = 30000;
/** Default build budget in SOL */
exports.DEFAULT_BUILD_BUDGET = 0.1;
/** SolForge program ID (placeholder - will be updated on deployment) */
exports.SOLFORGE_PROGRAM_ID = 'PLACEHOLDER_PROGRAM_ID';
/** Default network */
exports.DEFAULT_NETWORK = 'devnet';
/** Solana Explorer base URLs */
exports.EXPLORER_URLS = {
    devnet: 'https://explorer.solana.com',
    'mainnet-beta': 'https://explorer.solana.com',
};
/** Build step names */
exports.BUILD_STEPS = [
    'Analyzing specification',
    'Generating program code',
    'Creating tests',
    'Compiling program',
    'Running tests',
    'Deploying to network',
    'Verifying deployment',
    'Finalizing build',
];
/** SSE reconnection settings */
exports.SSE_CONFIG = {
    reconnectDelay: 3000,
    maxRetries: 5,
};
//# sourceMappingURL=constants.js.map