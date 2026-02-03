# SolForge Build Engine

The core backend that ACTUALLY compiles, tests, and deploys Anchor programs from natural language specs.

## Features

- 🤖 **AI-Powered Code Generation** - Uses Claude AI to generate Anchor/Rust code
- ⚙️ **Real Compilation** - Actually runs `anchor build`, not simulation
- 🧪 **Automated Testing** - Runs anchor test suite
- 🚀 **Devnet Deployment** - Deploys to Solana devnet with real Program IDs
- 📦 **SDK Generation** - Auto-generates TypeScript SDK for your program
- 📊 **Streaming Events** - SSE-based real-time build progress
- 🔗 **On-Chain Logging** - Records build steps on-chain (coming soon)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
```

3. Verify tools are installed:
- Anchor CLI: `/Users/prateektripathi/.cargo/bin/anchor`
- Solana CLI: `/opt/homebrew/bin/solana`
- Deploy key: `/Users/prateektripathi/.openclaw/workspace/autonomous-builder-x/deploy-key.json`

## Usage

### Start the server
```bash
npm run dev
```

### Build a program
```bash
curl -X POST http://localhost:3002/build \
  -H "Content-Type: application/json" \
  -d '{"spec":"Build a simple counter program"}'
```

### Check health
```bash
curl http://localhost:3002/health
```

### Get workspace stats
```bash
curl http://localhost:3002/stats
```

## Architecture

```
src/
├── index.ts          # Express server, SSE endpoints
├── builder.ts        # Core build orchestration
├── generator.ts      # Claude AI code generation
├── compiler.ts       # anchor build wrapper
├── tester.ts         # anchor test wrapper
├── deployer.ts       # anchor deploy wrapper
├── sdk-gen.ts        # TypeScript SDK generation
├── chain-logger.ts   # On-chain logging (coming soon)
├── workspace.ts      # Temp workspace management
└── types.ts          # Shared TypeScript types
```

## Build Flow

1. **Create Workspace** - Temp directory under `/tmp/solforge-builds/`
2. **Generate Code** - Claude AI creates Anchor program + tests
3. **Write Project** - Initialize Anchor project structure
4. **Compile** - Run `anchor build`
5. **Test** - Run `anchor test` (non-blocking)
6. **Deploy** - Deploy to devnet, extract Program ID
7. **Generate SDK** - Create TypeScript SDK for the program

## API

### POST /build

Request:
```json
{
  "spec": "Build a simple counter program that can increment and decrement"
}
```

Response (SSE stream):
```
data: {"type":"progress","step":1,"total":7,"description":"Creating workspace..."}
data: {"type":"code","file":"lib.rs","content":"use anchor_lang::prelude::*;..."}
data: {"type":"terminal","output":"Compiling counter v0.1.0..."}
data: {"type":"complete","programId":"5Km...abc","programName":"counter","sdk":"..."}
data: {"type":"result","success":true,"programId":"5Km...abc","sdk":"..."}
```

## Requirements

- Node.js v25.5.0+
- Anchor CLI 0.30.1+
- Solana CLI
- Anthropic API Key
- Solana keypair with devnet SOL

## Development

```bash
# Run in dev mode
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start
```

## License

MIT
