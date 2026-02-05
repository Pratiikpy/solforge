/**
 * Example: Request a build using the SolForge SDK
 */

import { SolForgeClient, StepType, BuildStatus } from '@solforge/sdk';
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

async function main() {
  // Initialize the SDK client
  const client = new SolForgeClient({
    rpcUrl: 'https://api.devnet.solana.com',
    commitment: 'confirmed',
  });

  // For this example, we'll generate a new keypair
  // In production, you'd load your keypair from a file
  const requester = Keypair.generate();
  
  console.log('Requester:', requester.publicKey.toBase58());
  console.log('⚠️  Make sure this account has SOL on devnet!');
  console.log();

  // Define the program spec
  const spec = `
    Create a simple counter program with:
    - initialize: Set up the counter
    - increment: Add 1 to the counter
    - decrement: Subtract 1 from the counter
    - get: Return the current value
  `.trim();

  console.log('Requesting build...');
  console.log('Spec:', spec);
  console.log();

  try {
    // Request the build
    const { signature, buildRequestPda, buildId } = await client.requestBuild({
      requester,
      spec,
      budgetLamports: new BN(0.5 * LAMPORTS_PER_SOL), // 0.5 SOL
    });

    console.log('✅ Build requested successfully!');
    console.log('  Transaction:', signature);
    console.log('  Build ID:', buildId.toString());
    console.log('  Build Request PDA:', buildRequestPda.toBase58());
    console.log();

    // Fetch the build request to confirm
    const buildRequest = await client.getBuildRequest(buildRequestPda);
    console.log('Build Request Details:');
    console.log('  Requester:', buildRequest.requester.toBase58());
    console.log('  Budget:', buildRequest.budget.toString(), 'lamports');
    console.log('  Status:', Object.keys(buildRequest.status)[0]);
    console.log('  Created:', new Date(buildRequest.createdAt.toNumber() * 1000).toISOString());
    console.log();

    // Monitor for changes
    console.log('Monitoring build status (polling every 5 seconds)...');
    let currentStepCount = 0;
    
    while (true) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const updated = await client.getBuildRequest(buildRequestPda);
      const status = Object.keys(updated.status)[0];
      
      // Check for new steps
      if (updated.stepCount > currentStepCount) {
        for (let i = currentStepCount; i < updated.stepCount; i++) {
          const step = await client.getBuildStep(buildRequestPda, i);
          console.log(`  [Step ${i + 1}] ${step.description}`);
        }
        currentStepCount = updated.stepCount;
      }
      
      // Check if complete
      if (status === 'completed') {
        console.log();
        console.log('✅ Build completed successfully!');
        if (updated.deployedProgramId) {
          console.log('  Deployed Program ID:', updated.deployedProgramId);
        }
        break;
      } else if (status === 'failed') {
        console.log();
        console.log('❌ Build failed');
        break;
      } else if (status === 'inProgress') {
        if (!updated.builder) {
          console.log('  Status: Claimed by builder', updated.builder?.toBase58());
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { main };
