/**
 * PDA (Program Derived Address) helpers
 * @module @solforge/sdk
 */
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
/**
 * Find the protocol state PDA
 * @returns Protocol state PDA and bump seed
 */
export declare function findProtocolStatePda(): [PublicKey, number];
/**
 * Find a build request PDA
 * @param requester The requester's public key
 * @param buildCount The build count from protocol state
 * @returns Build request PDA and bump seed
 */
export declare function findBuildRequestPda(requester: PublicKey, buildCount: BN | number): [PublicKey, number];
/**
 * Find an escrow PDA for a build request
 * @param buildRequestPda The build request PDA
 * @returns Escrow PDA and bump seed
 */
export declare function findEscrowPda(buildRequestPda: PublicKey): [PublicKey, number];
/**
 * Find a builder profile PDA
 * @param builderAuthority The builder's authority public key
 * @returns Builder profile PDA and bump seed
 */
export declare function findBuilderProfilePda(builderAuthority: PublicKey): [PublicKey, number];
/**
 * Find a build step PDA
 * @param buildRequestPda The build request PDA
 * @param stepNumber The step number (0-indexed)
 * @returns Build step PDA and bump seed
 */
export declare function findBuildStepPda(buildRequestPda: PublicKey, stepNumber: number): [PublicKey, number];
//# sourceMappingURL=pda.d.ts.map