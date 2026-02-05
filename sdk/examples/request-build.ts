/**
 * Example: Request a build
 */

import { SolForgeClient } from '../src';

async function main() {
  // Initialize client
  const client = new SolForgeClient({
    endpoint: 'https://solforge.dev/api',
    // apiKey: 'your-api-key', // Optional
  });

  // Define your program specification
  const spec = `
Build a token vesting program with the following features:
- Linear vesting schedule with configurable start and end dates
- Cliff period support (no tokens released before cliff)
- Multiple beneficiaries with individual schedules
- Admin can revoke vesting (tokens return to treasury)
- Partial withdrawals allowed after cliff
- Events emitted for vesting schedule creation and withdrawals
`;

  try {
    console.log('Requesting build...');
    const build = await client.requestBuild(spec, {
      budget: 0.1, // 0.1 SOL
      network: 'devnet',
    });

    console.log('Build requested successfully!');
    console.log('Build ID:', build.id);
    console.log('Status:', build.status);
    console.log('Estimated completion:', build.estimatedCompletion);

    if (build.paymentTx) {
      console.log('Payment transaction:', build.paymentTx);
    }

    // Now you can stream the build progress
    console.log('\nStreaming build events...');
    for await (const event of client.streamBuild(build.id)) {
      console.log(`[${event.type}]`, event.data);

      if (event.type === 'complete') {
        console.log('\n✅ Build completed!');
        console.log('Program ID:', event.data.programId);
        break;
      }

      if (event.type === 'error') {
        console.error('\n❌ Build failed:', event.data);
        break;
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
