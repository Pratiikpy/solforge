/**
 * PDA (Program Derived Address) helpers
 * @module @solforge/sdk
 */

import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { SOLFORGE_PROGRAM_ID, SEEDS } from './constants';

/**
 * Find the protocol state PDA
 * @returns Protocol state PDA and bump seed
 */
export function findProtocolStatePda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.PROTOCOL],
    SOLFORGE_PROGRAM_ID
  );
}

/**
 * Find a build request PDA
 * @param requester The requester's public key
 * @param buildCount The build count from protocol state
 * @returns Build request PDA and bump seed
 */
export function findBuildRequestPda(
  requester: PublicKey,
  buildCount: BN | number
): [PublicKey, number] {
  const countBuffer = Buffer.alloc(8);
  const bn = typeof buildCount === 'number' ? new BN(buildCount) : buildCount;
  bn.toArrayLike(Buffer, 'le', 8).copy(countBuffer);

  return PublicKey.findProgramAddressSync(
    [SEEDS.BUILD, requester.toBuffer(), countBuffer],
    SOLFORGE_PROGRAM_ID
  );
}

/**
 * Find an escrow PDA for a build request
 * @param buildRequestPda The build request PDA
 * @returns Escrow PDA and bump seed
 */
export function findEscrowPda(buildRequestPda: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.ESCROW, buildRequestPda.toBuffer()],
    SOLFORGE_PROGRAM_ID
  );
}

/**
 * Find a builder profile PDA
 * @param builderAuthority The builder's authority public key
 * @returns Builder profile PDA and bump seed
 */
export function findBuilderProfilePda(builderAuthority: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.BUILDER, builderAuthority.toBuffer()],
    SOLFORGE_PROGRAM_ID
  );
}

/**
 * Find a build step PDA
 * @param buildRequestPda The build request PDA
 * @param stepNumber The step number (0-indexed)
 * @returns Build step PDA and bump seed
 */
export function findBuildStepPda(
  buildRequestPda: PublicKey,
  stepNumber: number
): [PublicKey, number] {
  const stepBuffer = Buffer.alloc(4);
  stepBuffer.writeUInt32LE(stepNumber, 0);

  return PublicKey.findProgramAddressSync(
    [SEEDS.STEP, buildRequestPda.toBuffer(), stepBuffer],
    SOLFORGE_PROGRAM_ID
  );
}
