/**
 * SolForge SDK Constants
 * @module @solforge/sdk
 */
import { PublicKey } from '@solana/web3.js';
/** SolForge program ID (devnet) */
export declare const SOLFORGE_PROGRAM_ID: PublicKey;
/** PDA seeds */
export declare const SEEDS: {
    readonly PROTOCOL: Buffer<ArrayBuffer>;
    readonly BUILDER: Buffer<ArrayBuffer>;
    readonly BUILD: Buffer<ArrayBuffer>;
    readonly ESCROW: Buffer<ArrayBuffer>;
    readonly STEP: Buffer<ArrayBuffer>;
};
/** Build status enum mapping */
export declare const BuildStatus: {
    readonly Pending: {
        readonly pending: {};
    };
    readonly InProgress: {
        readonly inProgress: {};
    };
    readonly Completed: {
        readonly completed: {};
    };
    readonly Failed: {
        readonly failed: {};
    };
};
/** Step type enum mapping */
export declare const StepType: {
    readonly Analyze: {
        readonly analyze: {};
    };
    readonly GenerateCode: {
        readonly generateCode: {};
    };
    readonly Compile: {
        readonly compile: {};
    };
    readonly Test: {
        readonly test: {};
    };
    readonly Deploy: {
        readonly deploy: {};
    };
    readonly GenerateSdk: {
        readonly generateSdk: {};
    };
    readonly Document: {
        readonly document: {};
    };
};
/** Default RPC endpoints */
export declare const RPC_ENDPOINTS: {
    readonly devnet: "https://api.devnet.solana.com";
    readonly mainnet: "https://api.mainnet-beta.solana.com";
    readonly localhost: "http://localhost:8899";
};
//# sourceMappingURL=constants.d.ts.map