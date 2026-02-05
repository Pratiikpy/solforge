import Link from 'next/link';

export default function Home() {
  return (
    <div className="pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-green-500/20 bg-green-500/5 text-green-500 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            Autonomous AI Agent on Solana
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-extrabold mb-6 tracking-tight">
            <span className="text-white">Describe it.</span>
            <br />
            <span className="shimmer-text">We build it.</span>
            <br />
            <span className="text-white">On Solana.</span>
          </h1>
          
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            SolForge is an autonomous AI agent that generates, compiles, tests, and deploys 
            Solana programs from natural language — with every step verified on-chain.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/build"
              className="px-8 py-4 rounded-xl bg-green-500 text-black font-bold text-lg hover:bg-green-400 transition-all hover:shadow-xl hover:shadow-green-500/20 hover:scale-[1.02]"
            >
              Start Building →
            </Link>
            <a
              href="https://github.com/Pratiikpy/solforge"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl border border-white/10 text-gray-300 font-semibold text-lg hover:bg-white/5 hover:border-white/20 transition-all"
            >
              View Source ↗
            </a>
          </div>
        </div>

        {/* Terminal Demo - static */}
        <div className="glass-card p-1 mb-20 max-w-4xl mx-auto glow-green">
          <div className="bg-black rounded-[12px] p-6">
            <div className="flex items-center mb-5 space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <span className="text-gray-500 ml-3 text-xs font-mono">solforge — terminal</span>
            </div>
            <div className="font-mono min-h-[340px] text-sm leading-relaxed">
              <div className="mb-0.5 text-purple-400 font-semibold">$ solforge build --spec &quot;token vesting program&quot;</div>
              <div className="mb-0.5 text-gray-400">&gt; Registering build on Solana...</div>
              <div className="mb-0.5 text-green-500">&gt; ✓ Build requested (tx: 4xKp...9dFm)</div>
              <div className="mb-0.5 text-gray-400">&gt; Generating Anchor program with AI...</div>
              <div className="mb-0.5 text-green-500">&gt; ✓ Generated token_vesting (1,247 bytes)</div>
              <div className="mb-0.5 text-gray-400">&gt; Compiling with anchor build...</div>
              <div className="mb-0.5 text-green-500">&gt; ✓ Compilation successful</div>
              <div className="mb-0.5 text-gray-400">&gt; Running tests...</div>
              <div className="mb-0.5 text-green-500">&gt; ✓ 3/3 tests passing</div>
              <div className="mb-0.5 text-gray-400">&gt; Deploying to Solana devnet...</div>
              <div className="mb-0.5 text-green-500">&gt; ✓ Program deployed: 7xKXt...9Dpm</div>
              <div className="mb-0.5 text-green-500">&gt; ✓ All steps logged on-chain</div>
              <div className="mb-0.5 text-green-500">&gt; Build complete in 42.1s ⚡</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-20 max-w-3xl mx-auto">
          <div className="glass-card p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-1">✅</div>
            <div className="text-sm font-medium text-white mb-0.5">Deployed on Devnet</div>
            <div className="text-xs text-gray-500">Anchor program live</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-1">9/9</div>
            <div className="text-sm font-medium text-white mb-0.5">Tests Passing</div>
            <div className="text-xs text-gray-500">Full test coverage</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-1">AI</div>
            <div className="text-sm font-medium text-white mb-0.5">Powered by Kimi K2</div>
            <div className="text-xs text-gray-500">Code generation</div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-3 text-white">How It Works</h2>
          <p className="text-center text-gray-500 mb-12">From idea to deployed program in under a minute</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="glass-card p-6">
              <div className="text-3xl mb-4">✍️</div>
              <div className="text-xs font-mono text-green-500 mb-2">STEP 01</div>
              <div className="text-lg font-semibold text-white mb-2">Describe</div>
              <div className="text-sm text-gray-400 leading-relaxed">Tell us what you need in plain English</div>
            </div>
            <div className="glass-card-purple p-6">
              <div className="text-3xl mb-4">🧠</div>
              <div className="text-xs font-mono text-purple-400 mb-2">STEP 02</div>
              <div className="text-lg font-semibold text-white mb-2">Generate</div>
              <div className="text-sm text-gray-400 leading-relaxed">AI writes production Anchor code</div>
            </div>
            <div className="glass-card p-6">
              <div className="text-3xl mb-4">🔗</div>
              <div className="text-xs font-mono text-green-500 mb-2">STEP 03</div>
              <div className="text-lg font-semibold text-white mb-2">Verify</div>
              <div className="text-sm text-gray-400 leading-relaxed">Every step logged on Solana</div>
            </div>
            <div className="glass-card-purple p-6">
              <div className="text-3xl mb-4">🚀</div>
              <div className="text-xs font-mono text-purple-400 mb-2">STEP 04</div>
              <div className="text-lg font-semibold text-white mb-2">Ship</div>
              <div className="text-sm text-gray-400 leading-relaxed">Get your program ID + TypeScript SDK</div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="glass-card p-8 max-w-4xl mx-auto mb-20">
          <h3 className="text-xl font-bold text-white mb-6 text-center">Built With</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {['Solana', 'Anchor 0.30', 'Kimi K2 AI', 'Next.js', 'TypeScript', 'Rust', 'Devnet', 'SSE Streaming', 'PDA Escrow', 'On-Chain Proofs'].map((tech) => (
              <span key={tech} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 font-medium">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to build on Solana with AI?</h2>
          <Link
            href="/build"
            className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-purple-500 text-black font-bold text-lg hover:opacity-90 transition-all hover:shadow-xl"
          >
            Start Building →
          </Link>
        </div>
      </div>
    </div>
  );
}
