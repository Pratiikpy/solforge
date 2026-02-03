# SolForge Engine - Quick Start ⚡

## 30-Second Setup

```bash
# 1. Navigate to engine
cd /Users/prateektripathi/.openclaw/workspace/solforge/engine

# 2. Add your API key
echo "ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx" >> .env

# 3. Test it
npm test

# 4. Start server
npm run dev
```

## Test Build Request

```bash
# In another terminal
curl -X POST http://localhost:3002/build \
  -H "Content-Type: application/json" \
  -d '{"spec":"Build a simple counter program with increment and decrement"}'
```

## What You'll Get

```
✅ Generated Anchor/Rust code (lib.rs)
✅ Generated test code (.ts)
✅ Compiled binary
✅ Deployed Program ID on devnet
✅ TypeScript SDK
```

## Files You Need to Know

| File | Purpose |
|------|---------|
| `src/index.ts` | Express server (port 3002) |
| `src/builder.ts` | Core build orchestration |
| `src/generator.ts` | Claude AI code generation |
| `.env` | **ADD YOUR API KEY HERE** |
| `SETUP.md` | Detailed setup instructions |
| `STATUS.md` | Complete build status |

## Check Prerequisites

```bash
./check.sh
```

Should show all ✅ except API key.

## Get API Key

https://console.anthropic.com/

Copy the key that starts with `sk-ant-`

## Common Issues

**"ANTHROPIC_API_KEY not set"**
→ Add key to `.env` file (no quotes)

**"anchor: command not found"**  
→ Already installed at `/Users/prateektripathi/.cargo/bin/anchor`

**"Compilation failed"**
→ Check terminal output, try simpler spec

**"Deployment failed"**
→ Run `solana airdrop 2` for more SOL

## Architecture

```
Natural Language Spec
         ↓
    Claude AI
         ↓
  Anchor/Rust Code
         ↓
   anchor build  ← REAL COMPILATION
         ↓
   anchor test
         ↓
  anchor deploy  ← REAL DEPLOYMENT
         ↓
  Program ID + SDK
```

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/build` | Build program from spec |
| GET | `/health` | Health check |
| GET | `/stats` | Workspace stats |

## Example Response

```json
{
  "type": "complete",
  "success": true,
  "programId": "5KmE7sH...",
  "programName": "counter",
  "sdk": "export const PROGRAM_ID = '...';"
}
```

## Build Time

~2-3 minutes per program:
- Code gen: 10s
- Compile: 60s
- Test: 30s
- Deploy: 20s
- SDK: 10s

## Ready to Ship? ✅

1. [x] All code written (10 files)
2. [x] Dependencies installed (170 packages)
3. [x] Documentation complete
4. [x] Test script ready
5. [ ] **Add API key** ← YOU ARE HERE

---

**ONE COMMAND TO TEST:**
```bash
npm test
```

**ONE COMMAND TO DEPLOY:**
```bash
npm run dev
```

Done. Ship it. 🚀
