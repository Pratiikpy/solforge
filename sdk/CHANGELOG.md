# SDK Rewrite - February 5, 2025

## Summary

Completely rewrote the SolForge SDK from a fake REST API wrapper to a proper Anchor program client.

## What Changed

### Before
- ❌ Wrapped imaginary REST endpoints (`https://solforge.dev/api`)
- ❌ No actual on-chain interaction
- ❌ Fake build streaming
- ❌ Client/server architecture that doesn't exist

### After
- ✅ Direct Anchor program integration
- ✅ Real on-chain transactions via @coral-xyz/anchor
- ✅ PDA derivation helpers
- ✅ Proper account fetching and decoding
- ✅ Type-safe interactions with the deployed program

## New Architecture

```
sdk/
├── src/
│   ├── constants.ts    # Program ID, seeds, enums
│   ├── pda.ts          # PDA derivation functions
│   ├── types.ts        # TypeScript interfaces
│   ├── client.ts       # SolForgeClient class
│   └── index.ts        # Public exports
├── examples/
│   └── request-build.ts  # Usage example
├── package.json        # Updated dependencies
├── tsconfig.json
└── README.md          # Complete documentation
```

## Key Features

### 1. SolForgeClient Class
Main class for interacting with the on-chain program:
- `initialize()` - Init protocol
- `registerBuilder()` - Register a builder
- `requestBuild()` - Request a build with SOL escrow
- `claimBuild()` - Claim a pending build
- `logBuildStep()` - Log a build step
- `completeBuild()` - Complete/fail a build
- `getBuildRequest()` - Fetch build request account
- `getProtocolState()` - Fetch protocol state
- `getBuilderProfile()` - Fetch builder profile
- `getBuildStep()` - Fetch a build step
- `getAllBuilds()` - List all builds (with filters)
- `streamBuild()` - SSE stream from engine (convenience)

### 2. PDA Helpers
Functions for deriving program-derived addresses:
- `findProtocolStatePda()`
- `findBuildRequestPda(requester, buildCount)`
- `findEscrowPda(buildRequestPda)`
- `findBuilderProfilePda(builderAuthority)`
- `findBuildStepPda(buildRequestPda, stepNumber)`

### 3. Type Safety
Proper TypeScript types for:
- Account structures (ProtocolState, BuildRequest, BuilderProfile, BuildStep)
- Enums (BuildStatus, StepType)
- Method options
- Return values

### 4. Error Handling
- Input validation (spec length, description length, etc.)
- Account not found errors
- Proper error propagation from Anchor

## Dependencies

```json
{
  "dependencies": {
    "@coral-xyz/anchor": "^0.30.1",
    "@solana/web3.js": "^1.95.8",
    "bn.js": "^5.2.1"
  }
}
```

## Usage Example

```typescript
import { SolForgeClient } from '@solforge/sdk';
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

const client = new SolForgeClient({
  rpcUrl: 'https://api.devnet.solana.com',
});

const { buildRequestPda, buildId } = await client.requestBuild({
  requester: myKeypair,
  spec: 'Create a counter program',
  budgetLamports: new BN(0.5 * LAMPORTS_PER_SOL),
});
```

## Compilation

✅ TypeScript compilation: **PASSED**
✅ Type checking: **PASSED**
✅ Build artifacts: Generated in `dist/`

## Testing

Run the example:
```bash
cd examples
npx ts-node request-build.ts
```

## Breaking Changes

This is a complete rewrite. The old API is **NOT compatible**.

Old code using the REST client will need to be updated to use the new Anchor-based client.

## Program Information

- **Program ID (devnet):** `G45nBxWsUgxZsu9YTEt9QqHEsxtdc495xqnTR5SRwUAC`
- **IDL:** `../target/idl/solforge.json`
- **Anchor version:** 0.30.1

## Next Steps

For agents building on SolForge:
1. Install the SDK: `npm install @solforge/sdk`
2. Read the [README.md](./README.md) for full documentation
3. Check [examples/request-build.ts](./examples/request-build.ts) for usage
4. Use PDA helpers for account derivation
5. Handle build monitoring and step tracking
