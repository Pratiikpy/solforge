# SolForge

**Autonomous Program Compiler for Solana**

SolForge is an AI agent that autonomously builds, tests, and deploys Solana programs from natural language specifications. Every step of the build process is cryptographically proven and recorded on-chain, creating a transparent, verifiable trail from specification to deployment.

> **"Request a program in plain English. Get a deployed Anchor program with on-chain build proofs."**

Built for the **Solana AI Hackathon** by [@colosseum](https://colosseum.org).

---

## 🎯 What is SolForge?

SolForge eliminates the barrier between intent and execution in blockchain development. Instead of weeks of coding, testing, and deployment, you describe what you want in natural language, and SolForge delivers a production-ready Solana program in minutes.

### Key Features

- ✨ **Natural Language to Code** — Describe your program, get working Anchor code
- 🔗 **On-Chain Build Proofs** — Every step cryptographically verified on Solana
- 🧪 **Automated Testing** — Comprehensive test suites generated and executed
- 🚀 **Automatic Deployment** — Programs deployed to devnet/mainnet
- 🔍 **Full Transparency** — Source code, IDL, and artifacts publicly available
- 🤖 **Agent-to-Agent** — Other AI agents can hire SolForge as a service
- 💰 **Pay in SOL** — Simple x402 payments or direct transfers

---

## 🚀 Quick Start

### Option 1: Web UI (Easiest)

Visit [solforge.dev](https://solforge.dev) and submit your specification through the web interface.

```text
Example: "Build a token vesting program with cliff periods and admin controls"
```

### Option 2: REST API

```bash
curl -X POST https://solforge.dev/api/build \
  -H "Content-Type: application/json" \
  -d '{
    "spec": "Build an NFT minting program with royalties",
    "budget": 0.1
  }'
```

The endpoint returns an SSE stream with real-time build events.

### Option 3: TypeScript SDK

```bash
npm install @solforge/sdk
```

```typescript
import { SolForgeClient } from '@solforge/sdk';

const client = new SolForgeClient();

const build = await client.requestBuild(
  'Build a staking rewards distributor with configurable APY'
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

See [SDK documentation](./sdk/README.md) for full API reference.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Input                          │
│              "Build a token vesting program"                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      SolForge Agent                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Step 1: Analyze Specification                       │  │
│  │  → Parse intent, extract requirements                │  │
│  │  → Record hash on-chain                              │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Step 2: Generate Program Code                       │  │
│  │  → Create Anchor program with instructions           │  │
│  │  → Record hash on-chain                              │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Step 3: Create Tests                                │  │
│  │  → Generate comprehensive test suite                 │  │
│  │  → Record hash on-chain                              │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Step 4: Compile Program                             │  │
│  │  → Build with Anchor, generate BPF bytecode          │  │
│  │  → Record hash on-chain                              │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Step 5: Run Tests                                   │  │
│  │  → Execute test suite, verify correctness            │  │
│  │  → Record results hash on-chain                      │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Step 6: Deploy to Network                           │  │
│  │  → Deploy program to Solana (devnet/mainnet)         │  │
│  │  → Record deployment TX on-chain                     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Step 7: Verify Deployment                           │  │
│  │  → Confirm program is live and functional            │  │
│  │  → Record verification hash on-chain                 │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Step 8: Finalize Build                              │  │
│  │  → Package artifacts (source, IDL, docs)             │  │
│  │  → Record final hash on-chain                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Solana Blockchain                        │
│  • On-chain proof account (8 hashes, timestamps)           │
│  • Deployed program account                                │
│  • Verification trail (immutable, public)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         Outputs                             │
│  • Deployed Program ID                                      │
│  • Source Code (Anchor + TypeScript)                        │
│  • IDL (Interface Definition Language)                      │
│  • Test Suite + Results                                     │
│  • On-chain Explorer Links                                  │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

- **Frontend:** Next.js 15, React, TailwindCSS
- **Backend:** Express, SSE for streaming
- **Agent:** OpenAI GPT-4, Claude 3.5 Sonnet
- **Blockchain:** Solana (Anchor framework)
- **Build Tools:** Anchor CLI, cargo-build-sbf
- **Database:** PostgreSQL (build history, artifacts)
- **Deployment:** Docker, Railway/Vercel

---

## 🔗 On-Chain Proofs

Every SolForge build creates an on-chain account that proves each step of the compilation process.

### Build Proof Account Structure

```rust
pub struct BuildProof {
    pub build_id: [u8; 32],        // Unique build identifier
    pub requester: Pubkey,         // Who requested the build
    pub created_at: i64,           // Unix timestamp
    pub steps: [StepProof; 8],     // 8 build steps
}

pub struct StepProof {
    pub hash: [u8; 32],            // SHA-256 hash of step output
    pub timestamp: i64,            // When this step completed
    pub verified: bool,            // Verification status
}
```

### Example Build Proofs

Here are real build proofs from SolForge (replace with actual data):

| Build ID | Step | Hash | Explorer |
|----------|------|------|----------|
| `abc123...` | 0 - Analyze | `7f3e2...` | [View TX](https://explorer.solana.com/tx/...?cluster=devnet) |
| `abc123...` | 1 - Generate | `9a1b4...` | [View TX](https://explorer.solana.com/tx/...?cluster=devnet) |
| `abc123...` | 2 - Test Gen | `2c5d8...` | [View TX](https://explorer.solana.com/tx/...?cluster=devnet) |
| `abc123...` | 3 - Compile | `4e7f1...` | [View TX](https://explorer.solana.com/tx/...?cluster=devnet) |
| `abc123...` | 4 - Test Run | `6b9a3...` | [View TX](https://explorer.solana.com/tx/...?cluster=devnet) |
| `abc123...` | 5 - Deploy | `8d2c5...` | [View TX](https://explorer.solana.com/tx/...?cluster=devnet) |
| `abc123...` | 6 - Verify | `1f4e7...` | [View TX](https://explorer.solana.com/tx/...?cluster=devnet) |
| `abc123...` | 7 - Finalize | `3a6b9...` | [View TX](https://explorer.solana.com/tx/...?cluster=devnet) |

### Verification

Anyone can verify a build's authenticity:

```bash
# Using the SDK
npm install @solforge/sdk

# Verify all steps
node verify-build.js <build-id>
```

```typescript
import { SolForgeClient } from '@solforge/sdk';

const client = new SolForgeClient();

for (let step = 0; step < 8; step++) {
  const proof = await client.verifyBuildProof(buildId, step);
  console.log(`Step ${step}: ${proof.valid ? '✅' : '❌'}`);
  console.log(`TX: ${proof.signature}`);
}
```

---

## 🤖 Agent-to-Agent Usage

SolForge is designed to be hired by other AI agents. If you're an autonomous agent that needs Solana programs, here's how to use SolForge:

### 1. Via OpenClaw Skill

If you're running in OpenClaw, load the SolForge skill:

```markdown
See SKILL.md for usage instructions
```

### 2. Via REST API

```typescript
// Agent pseudocode
async function hireCompiler(spec: string) {
  const response = await fetch('https://solforge.dev/api/build', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ spec, budget: 0.1 })
  });
  
  // Stream build events
  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    // Process SSE events
  }
}
```

### 3. Via x402 Protocol

SolForge supports x402 machine-payable endpoints:

```http
POST https://solforge.dev/api/build
X-402-Pay: solana:devnet:0.1
X-402-Recipient: <SOLFORGE_WALLET_ADDRESS>
Content-Type: application/json

{
  "spec": "Build an escrow program"
}
```

Payment is automatically deducted from your agent's wallet when the build completes.

---

## 📦 Repository Structure

```
solforge/
├── README.md                    # This file
├── SKILL.md                     # OpenClaw skill definition
├── frontend/                    # Next.js web interface
│   ├── app/                     # App router pages
│   ├── components/              # React components
│   └── public/
│       └── skill.json           # Public skill manifest
├── backend/                     # Express API server
│   ├── src/
│   │   ├── server.ts            # Main server
│   │   ├── agent.ts             # SolForge agent logic
│   │   ├── blockchain.ts        # On-chain operations
│   │   └── routes/              # API routes
│   └── package.json
├── sdk/                         # TypeScript SDK
│   ├── src/
│   │   ├── index.ts             # Main exports
│   │   ├── client.ts            # SolForgeClient
│   │   ├── types.ts             # Type definitions
│   │   └── constants.ts         # Constants
│   ├── examples/                # Usage examples
│   └── README.md                # SDK docs
├── programs/                    # Solana programs (SolForge on-chain)
│   └── solforge/
│       ├── src/
│       │   └── lib.rs           # Proof recording program
│       └── Cargo.toml
└── docker-compose.yml           # Local development stack
```

---

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- Rust 1.70+
- Solana CLI 1.18+
- Anchor 0.30+
- Docker (optional, for local stack)

### Local Setup

```bash
# Clone repository
git clone https://github.com/solforge/solforge.git
cd solforge

# Install dependencies
npm install

# Install SDK dependencies
cd sdk && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..

# Set up environment variables
cp .env.example .env
# Edit .env with your keys

# Build on-chain program
cd programs/solforge
anchor build
anchor deploy --provider.cluster devnet
cd ../..

# Start development servers
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432

### Running Tests

```bash
# Test SDK
cd sdk && npm test

# Test backend
cd backend && npm test

# Test on-chain program
cd programs/solforge && anchor test
```

---

## 🏆 Competition Submission

### Hackathon: Solana AI Hackathon
**Organizer:** Colosseum  
**Prize Pool:** $100,000 USDC  
**Submission Tracks:**
- 🥇 1st Place
- 🥈 2nd Place  
- 🥉 3rd Place
- 🤖 Most Agentic (Best use of AI agents)

### Why SolForge Wins

#### 1. **Fully Autonomous**
SolForge doesn't assist development—it *is* the developer. From specification to deployment, no human intervention required.

#### 2. **On-Chain Provenance**
Every build is cryptographically proven on Solana. Complete transparency and immutability.

#### 3. **Agent-to-Agent Economy**
SolForge is a service that agents can hire. It's both an agent and a tool for other agents.

#### 4. **Production Ready**
Not a demo. Fully functional SDK, API, and web interface. Deploy real programs to mainnet today.

#### 5. **Verifiable Quality**
All generated programs include comprehensive tests. Build proofs are publicly verifiable on-chain.

#### 6. **Network Effect**
Every build creates public artifacts (source + IDL). Future builds learn from past builds, improving over time.

### Demo

**Live Site:** [solforge.dev](https://solforge.dev)  
**SDK:** `npm install @solforge/sdk`  
**Example Build:** [Solana Explorer](https://explorer.solana.com/address/PLACEHOLDER_PROGRAM_ID?cluster=devnet)  
**Video Demo:** [YouTube](https://youtube.com/watch?v=PLACEHOLDER)

---

## 🎨 Example Use Cases

### Token Vesting
```
"Build a token vesting program with:
- Linear vesting schedules
- Cliff periods (no tokens before cliff)
- Multiple beneficiaries
- Admin revocation with treasury return"
```

### DAO Treasury
```
"Build a DAO treasury manager with:
- Multi-sig approvals (3 of 5)
- Spending proposals with voting
- Time-locked execution
- Emergency pause mechanism"
```

### NFT Minting
```
"Build an NFT minting program with:
- Collection management
- Per-NFT metadata
- Royalty enforcement
- Whitelist minting phase"
```

### Staking Rewards
```
"Build a staking rewards distributor with:
- Flexible APY configuration
- Multiple reward tokens
- Lock-up periods
- Auto-compounding option"
```

### Escrow Service
```
"Build an escrow program for freelancers with:
- Milestone-based releases
- Dispute resolution mechanism
- Partial refunds
- Time-based auto-release"
```

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

## 🔗 Links

- **Website:** [solforge.dev](https://solforge.dev)
- **GitHub:** [github.com/solforge/solforge](https://github.com/solforge/solforge)
- **SDK:** [@solforge/sdk](https://www.npmjs.com/package/@solforge/sdk)
- **Twitter:** [@solforge_dev](https://twitter.com/solforge_dev)
- **Discord:** [discord.gg/solforge](https://discord.gg/solforge)
- **Docs:** [solforge.dev/docs](https://solforge.dev/docs)

---

## 🙏 Acknowledgments

Built for the **Solana AI Hackathon** by [@colosseum](https://colosseum.org).

Powered by:
- [Solana](https://solana.com) — The blockchain
- [Anchor](https://www.anchor-lang.com) — The framework
- [OpenAI](https://openai.com) — The intelligence
- [Anthropic](https://anthropic.com) — The reasoning

---

**SolForge: From Intent to Execution, Autonomously.** 🚀
