"use strict";
/**
 * PDA (Program Derived Address) helpers
 * @module @solforge/sdk
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findProtocolStatePda = findProtocolStatePda;
exports.findBuildRequestPda = findBuildRequestPda;
exports.findEscrowPda = findEscrowPda;
exports.findBuilderProfilePda = findBuilderProfilePda;
exports.findBuildStepPda = findBuildStepPda;
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = __importDefault(require("bn.js"));
const constants_1 = require("./constants");
/**
 * Find the protocol state PDA
 * @returns Protocol state PDA and bump seed
 */
function findProtocolStatePda() {
    return web3_js_1.PublicKey.findProgramAddressSync([constants_1.SEEDS.PROTOCOL], constants_1.SOLFORGE_PROGRAM_ID);
}
/**
 * Find a build request PDA
 * @param requester The requester's public key
 * @param buildCount The build count from protocol state
 * @returns Build request PDA and bump seed
 */
function findBuildRequestPda(requester, buildCount) {
    const countBuffer = Buffer.alloc(8);
    const bn = typeof buildCount === 'number' ? new bn_js_1.default(buildCount) : buildCount;
    bn.toArrayLike(Buffer, 'le', 8).copy(countBuffer);
    return web3_js_1.PublicKey.findProgramAddressSync([constants_1.SEEDS.BUILD, requester.toBuffer(), countBuffer], constants_1.SOLFORGE_PROGRAM_ID);
}
/**
 * Find an escrow PDA for a build request
 * @param buildRequestPda The build request PDA
 * @returns Escrow PDA and bump seed
 */
function findEscrowPda(buildRequestPda) {
    return web3_js_1.PublicKey.findProgramAddressSync([constants_1.SEEDS.ESCROW, buildRequestPda.toBuffer()], constants_1.SOLFORGE_PROGRAM_ID);
}
/**
 * Find a builder profile PDA
 * @param builderAuthority The builder's authority public key
 * @returns Builder profile PDA and bump seed
 */
function findBuilderProfilePda(builderAuthority) {
    return web3_js_1.PublicKey.findProgramAddressSync([constants_1.SEEDS.BUILDER, builderAuthority.toBuffer()], constants_1.SOLFORGE_PROGRAM_ID);
}
/**
 * Find a build step PDA
 * @param buildRequestPda The build request PDA
 * @param stepNumber The step number (0-indexed)
 * @returns Build step PDA and bump seed
 */
function findBuildStepPda(buildRequestPda, stepNumber) {
    const stepBuffer = Buffer.alloc(4);
    stepBuffer.writeUInt32LE(stepNumber, 0);
    return web3_js_1.PublicKey.findProgramAddressSync([constants_1.SEEDS.STEP, buildRequestPda.toBuffer(), stepBuffer], constants_1.SOLFORGE_PROGRAM_ID);
}
//# sourceMappingURL=pda.js.map