# SolForge Frontend

⚡ **Autonomous Solana Program Compiler** - Describe it. We build it. On Solana.

## Overview

SolForge is an AI-powered autonomous agent that compiles, deploys, and verifies Solana programs from natural language specifications. This is the frontend interface built with Next.js 15, React 19, and TailwindCSS.

## Features

- 🎨 **Beautiful Matrix-themed UI** - Green/purple cyberpunk aesthetic
- 🔴 **Live Build Streaming** - Watch AI compile your program in real-time via SSE
- 📊 **Build History** - Track all past builds with on-chain verification links
- 💰 **Agent Wallet** - View the autonomous agent's wallet and transactions
- 📚 **API Documentation** - Integration guides for other AI agents
- 🔗 **Solana Explorer Integration** - Direct links to verify everything on-chain

## Pages

- `/` - Landing page with animated terminal and stats
- `/build` - Interactive build interface with live streaming
- `/history` - Build history with verification links
- `/wallet` - Agent wallet address and transactions
- `/api-docs` - API documentation for agent integration

## Tech Stack

- **Next.js 15** - App Router, Server Components
- **React 19** - Latest features
- **TypeScript** - Type safety
- **TailwindCSS** - Styling with custom Matrix theme
- **@solana/web3.js** - Solana blockchain integration
- **@coral-xyz/anchor** - Anchor framework types
- **Server-Sent Events (SSE)** - Real-time build streaming

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## API Routes

### POST `/api/build`
Streams build events via Server-Sent Events (SSE)

**Request:**
```json
{
  "spec": "Build a token vesting program with cliff periods"
}
```

**Response Stream Events:**
- `status` - Status updates
- `thinking` - AI reasoning steps
- `code` - Generated code snippets
- `terminal` - Compilation output
- `progress` - Build progress (step/percent)
- `chain_log` - On-chain transaction logs
- `complete` - Build completion with Program ID
- `error` - Build errors

## Design System

### Colors
- Background: `#000000`
- Primary Green: `#22c55e`
- Accent Purple: `#a855f7`
- Matrix Dark: `#001a00`

### Components
- **Glass Cards** - Glassmorphism with green/purple borders
- **Terminal Output** - Monospace font with animated cursor
- **Typing Effects** - Animated text reveal
- **Pulsing Badges** - Verified on Solana indicators

## Skill Discovery

Other AI agents can discover SolForge via `/skill.json`:

```bash
curl https://solforge.app/skill.json
```

## Environment Variables

No environment variables required for the frontend. The mock API works out of the box.

## Production Deployment

This frontend is designed to connect to the SolForge backend agent. For production:

1. Update `/api/build` route to connect to real backend
2. Replace `PLACEHOLDER_PROGRAM_ID` with actual program IDs
3. Configure production Solana network (mainnet-beta)
4. Set up proper error handling and monitoring

## Contributing

This is part of the Solana Agent Hackathon submission. Built with ❤️ for the Solana ecosystem.

## License

MIT
