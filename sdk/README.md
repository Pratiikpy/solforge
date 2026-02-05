# @solforge/sdk

TypeScript SDK for **SolForge** — the autonomous program compiler for Solana.

Request Solana programs in natural language, get deployed Anchor programs with on-chain build proofs.

## Installation

```bash
npm install @solforge/sdk
```

## Quick Start

```typescript
import { SolForgeClient } from '@solforge/sdk';

const client = new SolForgeClient();

// Request a build
const build = await client.requestBuild(
  'Build a token vesting program with cliff periods'
);

console.log('Build ID:', build.id);

// Stream build progress
for await (const event of client.streamBuild(build.id)) {
  console.log(event.type, event.data);
  
  if (event.type === 'complete') {
    console.log('Program deployed:', event.data.programId);
    break;
  }
}
```

## API Reference

### SolForgeClient

#### Constructor

```typescript
new SolForgeClient(config?: {
  endpoint?: string;     // Default: 'https://solforge.dev/api'
  apiKey?: string;       // Optional API key
  timeout?: number;      // Request timeout in ms (default: 30000)
})
```

#### Methods

##### `requestBuild(spec: string, options?: BuildOptions): Promise<BuildRequest>`

Submit a build request with a natural language specification.

```typescript
const build = await client.requestBuild(
  'Build an NFT minting program with royalties',
  {
    budget: 0.1,           // SOL (default: 0.1)
    network: 'devnet',     // 'devnet' | 'mainnet-beta'
    webhookUrl: 'https://...', // Optional callback URL
  }
);
```

##### `getBuildStatus(buildId: string): Promise<BuildStatus>`

Get the current status of a build.

```typescript
const status = await client.getBuildStatus(buildId);
console.log(status.status);    // 'pending' | 'analyzing' | 'generating' | ...
console.log(status.progress);  // 0-100
console.log(status.programId); // Available when completed
```

##### `streamBuild(buildId: string): AsyncGenerator<BuildEvent>`

Stream real-time build events via Server-Sent Events (SSE).

```typescript
for await (const event of client.streamBuild(buildId)) {
  switch (event.type) {
    case 'status':
      console.log('Status update:', event.data);
      break;
    case 'log':
      console.log('Log:', event.data.message);
      break;
    case 'artifact':
      console.log('Artifact:', event.data.name);
      break;
    case 'complete':
      console.log('Build complete!', event.data);
      return;
    case 'error':
      console.error('Build failed:', event.data);
      return;
  }
}
```

##### `listBuilds(options?: ListOptions): Promise<BuildRecord[]>`

Get build history.

```typescript
const builds = await client.listBuilds({
  limit: 50,             // Max results (default: 50)
  offset: 0,             // Pagination offset
  status: 'completed',   // Filter by status
  order: 'desc',         // 'asc' | 'desc'
});
```

##### `verifyBuildProof(buildId: string, stepNumber: number): Promise<VerificationResult>`

Verify on-chain proof for a specific build step (0-7).

```typescript
const proof = await client.verifyBuildProof(buildId, 3);
console.log('Valid:', proof.valid);
console.log('Transaction:', proof.signature);
console.log('Hash:', proof.proof.hash);
```

##### `getDeployedProgram(buildId: string): Promise<ProgramInfo>`

Get full information about the deployed program.

```typescript
const program = await client.getDeployedProgram(buildId);
console.log('Program ID:', program.programId);
console.log('IDL:', program.idl);
console.log('Deployment TX:', program.deploymentTx);
```

## Types

### BuildStatus

```typescript
{
  id: string;
  status: 'pending' | 'analyzing' | 'generating' | 'compiling' | 
          'testing' | 'deploying' | 'completed' | 'failed';
  currentStep: number;  // 0-7
  totalSteps: number;   // 8
  progress: number;     // 0-100
  message: string;
  programId?: string;   // Available when completed
  artifacts?: {
    sourceCode?: string;
    idl?: any;
    testResults?: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### BuildEvent

```typescript
{
  type: 'status' | 'log' | 'artifact' | 'complete' | 'error';
  timestamp: string;
  data: any;
}
```

## Build Steps

Every build goes through 8 steps, all recorded on-chain:

1. **Analyzing specification** — Parse natural language into requirements
2. **Generating program code** — Create Anchor program source
3. **Creating tests** — Generate comprehensive test suite
4. **Compiling program** — Build with Anchor
5. **Running tests** — Execute test suite
6. **Deploying to network** — Deploy to Solana
7. **Verifying deployment** — Confirm on-chain
8. **Finalizing build** — Create final artifacts

## Error Handling

```typescript
import { SolForgeError } from '@solforge/sdk';

try {
  const build = await client.requestBuild(spec);
} catch (error) {
  if (error instanceof SolForgeError) {
    console.error('SolForge error:', error.code);
    console.error('Message:', error.message);
    console.error('Status:', error.statusCode);
    console.error('Details:', error.details);
  }
}
```

## Examples

See the `examples/` directory for complete examples:

- `request-build.ts` — Submit a build request and stream progress
- `check-status.ts` — Check build status and list history
- `verify-proof.ts` — Verify on-chain proofs

## Links

- **Homepage:** https://solforge.dev
- **Documentation:** https://solforge.dev/docs
- **GitHub:** https://github.com/solforge/solforge
- **Discord:** https://discord.gg/solforge

## License

MIT
