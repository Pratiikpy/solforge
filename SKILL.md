---
name: solforge
version: 1.0.0
description: Request autonomous Solana program builds from SolForge
---

# SolForge Skill

## What This Does

Lets your agent request fully autonomous Solana program compilation and deployment from the SolForge service. Submit a natural language specification, get back a deployed Anchor program with on-chain build proofs.

## When to Use

- Your agent needs a custom Solana program but doesn't want to write code
- You need on-chain functionality (tokens, NFTs, staking, escrow, etc.)
- You want cryptographic proof that the program was built correctly
- You're hiring another agent to do specialized work

## How It Works

1. **Submit specification** — Natural language description of what the program should do
2. **SolForge builds** — Autonomous agent generates, tests, and deploys the program
3. **On-chain proofs** — Each build step is cryptographically recorded on Solana
4. **Get program** — Receive deployed program ID, source code, IDL, and test results

## Cost

**0.1 SOL per build** (default, configurable)

Payment via x402 protocol or direct SOL transfer.

## API Endpoint

**Base URL:** `https://solforge.dev/api`

### Request Build

```http
POST /api/build
Content-Type: application/json

{
  "spec": "Natural language description of the program to build",
  "budget": 0.1,
  "network": "devnet"
}
```

**Response:** SSE stream with real-time build events

### Check Build Status

```http
GET /api/builds/{buildId}
```

**Response:**
```json
{
  "id": "abc123",
  "status": "completed",
  "progress": 100,
  "programId": "9xQe...",
  "artifacts": {
    "sourceCode": "...",
    "idl": {...},
    "testResults": "..."
  }
}
```

### List Builds

```http
GET /api/builds?limit=10&status=completed
```

## Usage Examples

### Example 1: Simple Token Vesting

```typescript
// Using curl
curl -X POST https://solforge.dev/api/build \
  -H "Content-Type: application/json" \
  -d '{
    "spec": "Build a token vesting program with cliff periods"
  }'
```

### Example 2: Complex DAO Treasury

```typescript
const spec = `
Build a DAO treasury manager with:
- Multi-sig approval (3 of 5 signers)
- Proposal creation and voting
- Time-locked execution (24h after approval)
- Emergency pause mechanism for admin
- Support for SOL and SPL tokens
`;

const response = await fetch('https://solforge.dev/api/build', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ spec, budget: 0.1 })
});
```

### Example 3: Using the TypeScript SDK

```typescript
import { SolForgeClient } from '@solforge/sdk';

const client = new SolForgeClient();

const build = await client.requestBuild(
  'Build an NFT minting program with royalties'
);

// Stream progress
for await (const event of client.streamBuild(build.id)) {
  console.log(event.type, event.data);
  
  if (event.type === 'complete') {
    console.log('Program deployed:', event.data.programId);
    break;
  }
}
```

## OpenClaw Integration

If you're an OpenClaw agent, you can use the `web_fetch` or `exec` tools:

### Using web_fetch (Simple)

```typescript
// 1. Request build
const response = await web_fetch({
  url: 'https://solforge.dev/api/build',
  method: 'POST',
  body: JSON.stringify({
    spec: 'Build a staking rewards distributor',
    budget: 0.1
  })
});

// Extract build ID from response
const buildId = response.id;

// 2. Poll for completion
let status;
do {
  await new Promise(r => setTimeout(r, 5000)); // Wait 5 seconds
  status = await web_fetch({
    url: `https://solforge.dev/api/builds/${buildId}`
  });
} while (status.status !== 'completed' && status.status !== 'failed');

if (status.status === 'completed') {
  console.log('Program deployed:', status.programId);
  console.log('IDL:', status.artifacts.idl);
}
```

### Using SDK (Better)

```bash
# Install SDK in your workspace
cd /Users/prateektripathi/.openclaw/workspace
npm install @solforge/sdk
```

```typescript
import { SolForgeClient } from '@solforge/sdk';

async function buildProgram(spec: string) {
  const client = new SolForgeClient();
  
  const build = await client.requestBuild(spec);
  console.log('Build started:', build.id);
  
  for await (const event of client.streamBuild(build.id)) {
    if (event.type === 'log') {
      console.log('[LOG]', event.data.message);
    }
    if (event.type === 'complete') {
      return {
        programId: event.data.programId,
        idl: event.data.idl,
        sourceUrl: event.data.sourceUrl
      };
    }
    if (event.type === 'error') {
      throw new Error(event.data.message);
    }
  }
}
```

## Build Steps

Every build goes through 8 steps (each proven on-chain):

1. **Analyzing specification** — Parse requirements from natural language
2. **Generating program code** — Create Anchor program source
3. **Creating tests** — Generate comprehensive test suite
4. **Compiling program** — Build with Anchor compiler
5. **Running tests** — Execute test suite, ensure correctness
6. **Deploying to network** — Deploy to Solana (devnet/mainnet)
7. **Verifying deployment** — Confirm program is live
8. **Finalizing build** — Package artifacts and proofs

## What You Get

When a build completes, you receive:

- **Program ID** — Deployed Solana program address
- **Source Code** — Full Anchor program + TypeScript client
- **IDL** — Interface Definition Language (JSON)
- **Test Suite** — Comprehensive tests with results
- **On-chain Proofs** — 8 transaction signatures proving each build step
- **Explorer Links** — View on Solana Explorer

## Verification

All builds are cryptographically verifiable on-chain:

```typescript
const client = new SolForgeClient();

// Verify all 8 steps
for (let step = 0; step < 8; step++) {
  const proof = await client.verifyBuildProof(buildId, step);
  console.log(`Step ${step}: ${proof.valid ? '✅' : '❌'}`);
  console.log(`  TX: ${proof.signature}`);
  console.log(`  Hash: ${proof.proof.hash}`);
}
```

## Common Use Cases

### 1. Token Vesting
```
"Build a token vesting program with cliff periods and admin controls"
```

### 2. DAO Treasury
```
"Build a DAO treasury manager with multi-sig and voting"
```

### 3. NFT Minting
```
"Build an NFT minting program with metadata and royalties"
```

### 4. Staking
```
"Build a staking rewards distributor with flexible APY"
```

### 5. Escrow
```
"Build an escrow program for freelancers with milestone releases"
```

### 6. Payment Splitter
```
"Build a payment splitter that divides revenue among team members"
```

## Error Handling

```typescript
try {
  const build = await client.requestBuild(spec);
} catch (error) {
  if (error.code === 'INVALID_SPEC') {
    console.error('Specification is too vague or invalid');
  } else if (error.code === 'INSUFFICIENT_FUNDS') {
    console.error('Not enough SOL in your wallet');
  } else if (error.code === 'BUILD_FAILED') {
    console.error('Build failed:', error.details);
  }
}
```

## Tips for Good Specifications

✅ **Do:**
- Be specific about functionality
- Mention security requirements
- Specify access controls (who can do what)
- Include error handling expectations
- Reference similar programs if helpful

❌ **Don't:**
- Be too vague ("make a program")
- Use implementation details (SolForge decides those)
- Request illegal or malicious functionality
- Assume specific Anchor versions

### Good Example

```
Build a token vesting program with:
- Linear vesting over configurable duration
- Cliff period (no tokens before cliff date)
- Support for multiple beneficiaries
- Admin can revoke unvested tokens
- Beneficiaries can withdraw vested amounts anytime
- Events emitted for all state changes
```

### Bad Example

```
"Make a vesting thing"
```

## Rate Limits

- **10 builds per hour** per API key/wallet
- **50 builds per day** per API key/wallet
- No limit on status checks or verification

## Support

- **Documentation:** https://solforge.dev/docs
- **Discord:** https://discord.gg/solforge
- **GitHub:** https://github.com/solforge/solforge
- **Issues:** https://github.com/solforge/solforge/issues

## Advanced: x402 Payments

If your agent supports x402 protocol, SolForge will automatically handle payments:

```http
POST https://solforge.dev/api/build
X-402-Pay: solana:devnet:0.1
X-402-Recipient: <SOLFORGE_WALLET>
Content-Type: application/json

{"spec": "Build an escrow program"}
```

Payment is deducted only when the build completes successfully.

---

**Ready to build?** → https://solforge.dev
