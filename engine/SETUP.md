# SolForge Engine Setup Guide

## Quick Start

### 1. Get Your Anthropic API Key

You need a Claude API key. Get one from: https://console.anthropic.com/

Or check if OpenClaw has one configured:
```bash
# Check OpenClaw's config
cat ~/.openclaw/config.yml | grep -i anthropic

# Or check environment
printenv | grep ANTHROPIC
```

### 2. Add API Key to .env

Edit the `.env` file:
```bash
cd /Users/prateektripathi/.openclaw/workspace/solforge/engine
nano .env
```

Add your key:
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
PORT=3002
```

### 3. Verify Prerequisites

Check that all required tools are installed:

```bash
# Anchor CLI
/Users/prateektripathi/.cargo/bin/anchor --version
# Should show: anchor-cli 0.30.1 or higher

# Solana CLI
/opt/homebrew/bin/solana --version
# Should show: solana-cli 1.x.x

# Deploy key exists
ls -l /Users/prateektripathi/.openclaw/workspace/autonomous-builder-x/deploy-key.json

# Node version
node --version
# Should be v25.5.0
```

### 4. Test the Engine

Run the test script:
```bash
npm test
```

This will:
1. Generate a simple counter program with Claude
2. Compile it with `anchor build`
3. Run tests
4. Deploy to Solana devnet
5. Generate a TypeScript SDK

Expected output:
```
🧪 Testing SolForge Engine...

✓ API key found
✓ Starting build test

[1/7] Creating workspace...
[2/7] Analyzing spec with Claude AI...

📄 Generated lib.rs:
──────────────────────────────────────────────────
use anchor_lang::prelude::*;

declare_id!("...");

#[program]
pub mod counter {
...
──────────────────────────────────────────────────

[3/7] Setting up Anchor project...
[4/7] Compiling with anchor build...

📟 Terminal output:
Compiling counter v0.1.0
...

[5/7] Running tests...
[6/7] Deploying to Solana devnet...
[7/7] Generating TypeScript SDK...

✅ Build Complete!
Program ID: 5KmE7sH...
Program Name: counter

════════════════════════════════════════════════════════════
FINAL RESULT
════════════════════════════════════════════════════════════
Success: true
Program ID: 5KmE7sH...
Program Name: counter

🎉 Test PASSED! Engine is working correctly.
```

### 5. Start the Server

```bash
npm run dev
```

Expected output:
```
╔═══════════════════════════════════════╗
║   SolForge Build Engine v1.0.0        ║
║   Port: 3002                          ║
║   Status: READY                       ║
╚═══════════════════════════════════════╝

Endpoints:
  GET  /health  - Health check
  GET  /stats   - Workspace statistics
  POST /build   - Build Anchor program from spec

Waiting for build requests...
```

### 6. Test with cURL

In another terminal:
```bash
curl -X POST http://localhost:3002/build \
  -H "Content-Type: application/json" \
  -d '{"spec":"Build a simple counter program"}'
```

You should see streaming events as the build progresses.

## Troubleshooting

### "ANTHROPIC_API_KEY not set"
- Make sure `.env` file exists in engine/ directory
- Check that the key is properly formatted: `ANTHROPIC_API_KEY=sk-ant-...`
- No quotes needed around the key

### "anchor: command not found"
- Check anchor is at: `/Users/prateektripathi/.cargo/bin/anchor`
- If not, install: `cargo install --git https://github.com/coral-xyz/anchor avm --locked && avm install 0.30.1 && avm use 0.30.1`

### "Deploy key not found"
- Check key exists: `ls /Users/prateektripathi/.openclaw/workspace/autonomous-builder-x/deploy-key.json`
- Or generate new one: `solana-keygen new --outfile /tmp/deploy-key.json`
- Update path in `src/deployer.ts`

### "Compilation failed"
- This usually means Claude generated invalid code
- Check the terminal output for specific Rust errors
- Try again with a simpler spec
- Workspaces are saved in `/tmp/solforge-builds/` for debugging

### "Deployment failed"
- Check Solana devnet is up: `solana cluster-version`
- Check keypair has SOL: `solana balance`
- Try manual airdrop: `solana airdrop 2`

## Next Steps

Once working:
1. Integrate with SolForge frontend
2. Add on-chain logging (update chain-logger.ts)
3. Add build history/caching
4. Deploy SolForge program itself
5. Add webhook support for async builds

## File Structure

```
engine/
├── src/
│   ├── index.ts          # Express server ✓
│   ├── builder.ts        # Core orchestration ✓
│   ├── generator.ts      # Claude code generation ✓
│   ├── compiler.ts       # anchor build wrapper ✓
│   ├── tester.ts         # anchor test wrapper ✓
│   ├── deployer.ts       # anchor deploy wrapper ✓
│   ├── sdk-gen.ts        # SDK generation ✓
│   ├── chain-logger.ts   # On-chain logging (TODO)
│   ├── workspace.ts      # Workspace management ✓
│   └── types.ts          # TypeScript types ✓
├── test/
│   └── simple.ts         # Test script ✓
├── package.json          # Dependencies ✓
├── tsconfig.json         # TypeScript config ✓
├── .env                  # Environment variables (ADD KEY!)
├── .env.example          # Template ✓
└── README.md             # Documentation ✓
```

All components are built and ready. Just need the API key!
