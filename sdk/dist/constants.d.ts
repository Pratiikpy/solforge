/**
 * SolForge SDK Constants
 * @module @solforge/sdk
 */
/** Default API endpoint */
export declare const DEFAULT_ENDPOINT = "https://solforge.dev/api";
/** Default request timeout (30 seconds) */
export declare const DEFAULT_TIMEOUT = 30000;
/** Default build budget in SOL */
export declare const DEFAULT_BUILD_BUDGET = 0.1;
/** SolForge program ID (placeholder - will be updated on deployment) */
export declare const SOLFORGE_PROGRAM_ID = "PLACEHOLDER_PROGRAM_ID";
/** Default network */
export declare const DEFAULT_NETWORK = "devnet";
/** Solana Explorer base URLs */
export declare const EXPLORER_URLS: {
    devnet: string;
    'mainnet-beta': string;
};
/** Build step names */
export declare const BUILD_STEPS: readonly ["Analyzing specification", "Generating program code", "Creating tests", "Compiling program", "Running tests", "Deploying to network", "Verifying deployment", "Finalizing build"];
/** SSE reconnection settings */
export declare const SSE_CONFIG: {
    reconnectDelay: number;
    maxRetries: number;
};
//# sourceMappingURL=constants.d.ts.map