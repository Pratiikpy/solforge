/**
 * Example: Verify on-chain build proofs
 */

import { SolForgeClient, BUILD_STEPS } from '../src';

async function main() {
  const client = new SolForgeClient();
  const buildId = 'your-build-id'; // Replace with actual build ID

  try {
    console.log('Verifying on-chain build proofs...\n');

    // Verify each step of the build process
    for (let step = 0; step < BUILD_STEPS.length; step++) {
      console.log(`Verifying Step ${step}: ${BUILD_STEPS[step]}...`);

      try {
        const verification = await client.verifyBuildProof(buildId, step);

        if (verification.valid) {
          console.log('✅ Valid proof');
          console.log('   Transaction:', verification.signature);
          console.log('   Hash:', verification.proof.hash);
          console.log('   Timestamp:', new Date(verification.proof.timestamp * 1000).toLocaleString());
          console.log('   Explorer:', `https://explorer.solana.com/tx/${verification.signature}?cluster=devnet`);
        } else {
          console.log('❌ Invalid proof');
        }
      } catch (error: any) {
        console.log(`⚠️  Step not yet verified: ${error.message}`);
      }

      console.log('');
    }

    // Get full program information
    console.log('\n=== Deployed Program Info ===');
    const program = await client.getDeployedProgram(buildId);

    console.log('Program ID:', program.programId);
    console.log('Network:', program.network);
    console.log('Deployment TX:', program.deploymentTx);
    console.log('Deployed at:', new Date(program.deployedAt).toLocaleString());

    if (program.sourceUrl) {
      console.log('Source code:', program.sourceUrl);
    }

    console.log('\nIDL:');
    console.log(JSON.stringify(program.idl, null, 2));

    console.log('\nExplorer Links:');
    console.log('Program:', `https://explorer.solana.com/address/${program.programId}?cluster=${program.network}`);
    console.log('Deployment:', `https://explorer.solana.com/tx/${program.deploymentTx}?cluster=${program.network}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
