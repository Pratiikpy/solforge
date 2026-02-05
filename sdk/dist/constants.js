"use strict";
/**
 * SolForge SDK Constants
 * @module @solforge/sdk
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RPC_ENDPOINTS = exports.StepType = exports.BuildStatus = exports.SEEDS = exports.SOLFORGE_PROGRAM_ID = void 0;
const web3_js_1 = require("@solana/web3.js");
/** SolForge program ID (devnet) */
exports.SOLFORGE_PROGRAM_ID = new web3_js_1.PublicKey('G45nBxWsUgxZsu9YTEt9QqHEsxtdc495xqnTR5SRwUAC');
/** PDA seeds */
exports.SEEDS = {
    PROTOCOL: Buffer.from('protocol'),
    BUILDER: Buffer.from('builder'),
    BUILD: Buffer.from('build'),
    ESCROW: Buffer.from('escrow'),
    STEP: Buffer.from('step'),
};
/** Build status enum mapping */
exports.BuildStatus = {
    Pending: { pending: {} },
    InProgress: { inProgress: {} },
    Completed: { completed: {} },
    Failed: { failed: {} },
};
/** Step type enum mapping */
exports.StepType = {
    Analyze: { analyze: {} },
    GenerateCode: { generateCode: {} },
    Compile: { compile: {} },
    Test: { test: {} },
    Deploy: { deploy: {} },
    GenerateSdk: { generateSdk: {} },
    Document: { document: {} },
};
/** Default RPC endpoints */
exports.RPC_ENDPOINTS = {
    devnet: 'https://api.devnet.solana.com',
    mainnet: 'https://api.mainnet-beta.solana.com',
    localhost: 'http://localhost:8899',
};
//# sourceMappingURL=constants.js.map