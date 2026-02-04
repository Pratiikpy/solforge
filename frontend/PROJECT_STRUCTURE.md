# SolForge Frontend - Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx           # Root layout with Navigation
│   │   ├── page.tsx             # Landing page (/)
│   │   ├── globals.css          # Global styles + Matrix theme
│   │   ├── not-found.tsx        # 404 page
│   │   │
│   │   ├── build/               # Live build page
│   │   │   └── page.tsx         # SSE streaming build interface
│   │   │
│   │   ├── history/             # Build history
│   │   │   └── page.tsx         # Past builds with verification
│   │   │
│   │   ├── wallet/              # Agent wallet
│   │   │   └── page.tsx         # Wallet info and transactions
│   │   │
│   │   ├── api-docs/            # API documentation
│   │   │   └── page.tsx         # Integration guides
│   │   │
│   │   └── api/                 # API routes
│   │       └── build/
│   │           └── route.ts     # SSE build endpoint (mock)
│   │
│   └── components/              # Reusable components
│       └── Navigation.tsx       # Top navigation bar
│
├── public/
│   └── skill.json              # Agent skill discovery file
│
├── tailwind.config.ts          # TailwindCSS + Matrix theme
├── tsconfig.json               # TypeScript config
├── next.config.ts              # Next.js config
├── package.json                # Dependencies
├── README.md                   # Project documentation
└── PROJECT_STRUCTURE.md        # This file

## Page Routes

| Route        | Component            | Description                          |
|--------------|----------------------|--------------------------------------|
| `/`          | `app/page.tsx`       | Landing page with hero + stats       |
| `/build`     | `app/build/page.tsx` | Interactive build interface          |
| `/history`   | `app/history/page.tsx` | Build history with stats           |
| `/wallet`    | `app/wallet/page.tsx` | Agent wallet and transactions       |
| `/api-docs`  | `app/api-docs/page.tsx` | API documentation               |
| `/skill.json`| `public/skill.json`  | Agent skill discovery (static)       |

## API Routes

| Route        | Method | Description                          |
|--------------|--------|--------------------------------------|
| `/api/build` | POST   | SSE streaming build endpoint (mock)  |

## Key Features

### Landing Page (`/`)
- Animated hero with lightning emoji
- Live terminal animation showing build process
- Animated stats counter (builds, programs, SOL earned)
- "How It Works" 4-step guide
- CTA buttons to start building

### Build Page (`/build`)
- Text input for natural language specs
- 6 example prompt pills (clickable)
- Split-screen build interface:
  - AI Reasoning (left panel)
  - Terminal Output (right panel)
  - Code Preview (bottom left)
  - On-Chain Verification (bottom right)
- Progress bar (Step X/7)
- SSE real-time streaming
- Completion card with Program ID + Explorer links

### History Page (`/history`)
- Stats dashboard (total, success rate, avg time)
- List of past builds with status badges
- Direct links to Solana Explorer
- Filterable/sortable (future enhancement)

### Wallet Page (`/wallet`)
- Agent wallet address with copy button
- Current SOL balance (animated)
- Recent transactions list
- Links to Solana Explorer for each tx

### API Docs Page (`/api-docs`)
- Quick start guide
- Full API reference table
- Code examples (Python, TypeScript)
- Copy-to-clipboard for all code blocks
- skill.json discovery documentation

## Design System

### Color Palette
- `#000000` - Background
- `#22c55e` - Matrix Green (primary)
- `#a855f7` - Purple (accent)
- `#001a00` - Dark Green gradient

### Typography
- Font: JetBrains Mono (or system monospace)
- Weights: 400, 600, 700

### Components
- **Glass Cards** - `glass-card` and `glass-card-purple`
- **Terminal Output** - `terminal-output` with monospace
- **Animated Badges** - `animate-pulse-slow`
- **Glow Effects** - `animate-glow`

## Mock Data

All pages currently use mock data:
- Build history: 5 sample builds
- Wallet: Mock transactions
- Stats: Animated counters

## Next Steps for Production

1. **Backend Integration**
   - Replace `/api/build` mock with real SolForge backend
   - Add WebSocket/SSE connection to actual build agent
   - Implement authentication for paid builds

2. **Database Integration**
   - Store build history in database
   - Track user accounts and builds
   - Real wallet integration

3. **Enhanced Features**
   - Build filtering/search
   - User authentication
   - Real-time notifications
   - SDK download functionality
   - Build logs download

4. **Performance**
   - Add caching for build history
   - Optimize bundle size
   - Add loading states
   - Error boundaries

5. **SEO & Marketing**
   - Add proper meta tags per page
   - Create OG images
   - Add analytics
   - Blog/docs section

## Development

```bash
# Install
npm install

# Dev server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production
npm start

# Type checking
npm run type-check
```

## Built With

- Next.js 15.1.6
- React 19
- TypeScript 5.x
- TailwindCSS 3.x
- @solana/web3.js
- @coral-xyz/anchor

---

**Status**: ✅ Fully functional frontend with mock data
**Ready for**: Backend integration + production deployment
