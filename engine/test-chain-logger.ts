#!/usr/bin/env ts-node

import {
  ensureProtocolInitialized,
  ensureBuilderRegistered,
  initializeBuildLogger,
  logBuildStep,
  logBuildComplete,
} from './src/chain-logger';

async function test() {
  console.log('\n=== Testing SolForge Chain Logger ===\n');

  try {
    // Test 1: Initialize protocol
    console.log('1. Initializing protocol...');
    const initResult = await ensureProtocolInitialized();
    console.log('   Result:', initResult);

    // Test 2: Register builder
    console.log('\n2. Registering builder...');
    const registerResult = await ensureBuilderRegistered();
    console.log('   Result:', registerResult);

    // Test 3: Initialize build logger
    console.log('\n3. Initializing build logger...');
    const logger = await initializeBuildLogger(
      'test-build-123',
      'Create a simple counter program'
    );
    
    if (!logger) {
      console.error('Failed to initialize logger');
      process.exit(1);
    }
    
    console.log('   Build Request PDA:', logger.buildRequestPDA.toBase58());
    console.log('   Build ID:', logger.buildId);

    // Test 4: Log some steps
    console.log('\n4. Logging build steps...');
    
    await logBuildStep(logger, {
      buildId: 'test-build-123',
      step: 'analyze',
      status: 'success',
      timestamp: Date.now(),
      metadata: { spec: 'Create a simple counter program' },
    });

    await logBuildStep(logger, {
      buildId: 'test-build-123',
      step: 'generate',
      status: 'success',
      timestamp: Date.now(),
      metadata: { programCode: 'pub fn increment(ctx: Context<Increment>) -> Result<()> { ... }' },
    });

    await logBuildStep(logger, {
      buildId: 'test-build-123',
      step: 'compile',
      status: 'success',
      timestamp: Date.now(),
      metadata: { output: 'Build successful' },
    });

    // Test 5: Complete build
    console.log('\n5. Completing build...');
    await logBuildComplete(
      logger,
      'test-build-123',
      'ExampleProgramId11111111111111111111111111',
      'counter'
    );

    console.log('\n=== Test Complete! ===\n');
    console.log('All transactions:');
    console.log('- Request:', logger.signatures.requestBuild);
    console.log('- Claim:', logger.signatures.claimBuild);
    logger.signatures.steps.forEach((sig, i) => {
      console.log(`- Step ${i + 1}:`, sig);
    });
    console.log('- Complete:', logger.signatures.complete);
    console.log('\nCheck on Solana Explorer (devnet)!');

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

test();
