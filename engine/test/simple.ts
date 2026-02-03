#!/usr/bin/env tsx
/**
 * Simple test script for SolForge Engine
 * Tests the build flow with a simple counter program spec
 */

import dotenv from 'dotenv';
import { executeBuild } from '../src/builder';
import { BuildEvent } from '../src/types';

dotenv.config();

const COUNTER_SPEC = `
Build a simple counter program with the following features:
- A counter account that stores a u64 value
- An initialize instruction to create the counter
- An increment instruction to increase the counter by 1
- A decrement instruction to decrease the counter by 1
Keep it minimal and compilable.
`;

async function test() {
  console.log('🧪 Testing SolForge Engine...\n');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not set in .env');
    console.error('Add your API key to .env file');
    process.exit(1);
  }

  console.log('✓ API key found');
  console.log('✓ Starting build test\n');

  const events: BuildEvent[] = [];

  const handleEvent = (event: BuildEvent) => {
    events.push(event);

    if (event.type === 'progress') {
      console.log(`[${event.step}/${event.total}] ${event.description}`);
    } else if (event.type === 'code') {
      console.log(`\n📄 Generated ${event.file}:`);
      console.log('─'.repeat(50));
      console.log(event.content?.substring(0, 200) + '...');
      console.log('─'.repeat(50) + '\n');
    } else if (event.type === 'terminal') {
      console.log('\n📟 Terminal output:');
      console.log(event.output?.substring(0, 300) + '...\n');
    } else if (event.type === 'error') {
      console.error('\n❌ Error:', event.error);
    } else if (event.type === 'complete') {
      console.log('\n✅ Build Complete!');
      console.log(`Program ID: ${event.programId}`);
      console.log(`Program Name: ${event.programName}`);
      console.log(`SDK Generated: ${event.sdk ? 'Yes' : 'No'}`);
    }
  };

  try {
    const result = await executeBuild(COUNTER_SPEC, handleEvent);

    console.log('\n' + '='.repeat(60));
    console.log('FINAL RESULT');
    console.log('='.repeat(60));
    console.log('Success:', result.success);
    
    if (result.success) {
      console.log('Program ID:', result.programId);
      console.log('Program Name:', result.programName);
      console.log('SDK Length:', result.sdk?.length, 'chars');
      console.log('\n🎉 Test PASSED! Engine is working correctly.');
    } else {
      console.error('Error:', result.error);
      console.log('\n💥 Test FAILED!');
      process.exit(1);
    }

  } catch (error: any) {
    console.error('\n💥 Test crashed:', error.message);
    process.exit(1);
  }
}

test();
