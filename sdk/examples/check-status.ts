/**
 * Example: Check build status and list builds
 */

import { SolForgeClient } from '../src';

async function main() {
  const client = new SolForgeClient();

  // Check status of a specific build
  const buildId = 'your-build-id'; // Replace with actual build ID

  try {
    console.log('Fetching build status...');
    const status = await client.getBuildStatus(buildId);

    console.log('\nBuild Status:');
    console.log('ID:', status.id);
    console.log('Status:', status.status);
    console.log('Progress:', `${status.progress}%`);
    console.log('Current Step:', `${status.currentStep}/${status.totalSteps}`);
    console.log('Message:', status.message);

    if (status.programId) {
      console.log('Program ID:', status.programId);
      console.log('Explorer:', `https://explorer.solana.com/address/${status.programId}?cluster=devnet`);
    }

    if (status.artifacts) {
      console.log('\nArtifacts available:');
      if (status.artifacts.sourceCode) console.log('- Source code');
      if (status.artifacts.idl) console.log('- IDL');
      if (status.artifacts.testResults) console.log('- Test results');
    }

    if (status.error) {
      console.error('\nError:', status.error.message);
      console.error('Code:', status.error.code);
    }

    // List all builds
    console.log('\n\n=== Build History ===');
    const builds = await client.listBuilds({
      limit: 10,
      order: 'desc',
    });

    console.log(`Found ${builds.length} builds:\n`);
    builds.forEach((build, index) => {
      console.log(`${index + 1}. [${build.status}] ${build.id}`);
      console.log(`   Spec: ${build.spec.substring(0, 60)}...`);
      console.log(`   Created: ${new Date(build.createdAt).toLocaleString()}`);
      if (build.programId) {
        console.log(`   Program: ${build.programId}`);
      }
      console.log('');
    });

    // Filter by status
    console.log('\n=== Completed Builds ===');
    const completed = await client.listBuilds({
      status: 'completed',
      limit: 5,
    });

    console.log(`${completed.length} completed builds`);
    completed.forEach((build) => {
      console.log(`- ${build.id}: ${build.programId}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
