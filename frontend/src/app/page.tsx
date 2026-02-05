'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [stats, setStats] = useState({
    builds: 0,
    programs: 0,
    sol: 0,
  });

  useEffect(() => {
    // Animated terminal simulation
    const lines = [
      '$ solforge build --spec "token vesting program"',
      '> Initializing SolForge compiler...',
      '> Analyzing specification...',
      '> Generating Anchor program structure...',
      '> Writing lib.rs, state.rs, instructions.rs...',
      '> Compiling with cargo build-sbf...',
      '> ✓ Compilation successful',
      '> Deploying to Solana devnet...',
      '> ✓ Program deployed: 7xKXt...9Dpm',
      '> Build complete in 47.2s',
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < lines.length) {
        setTerminalLines((prev) => [...prev, lines[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setTerminalLines([]);
          currentIndex = 0;
        }, 2000);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [terminalLines.length === 0]);

  useEffect(() => {
    // Fetch real stats from engine (or show defaults)
    async function fetchStats() {
      try {
        const engineUrl = process.env.NEXT_PUBLIC_ENGINE_URL || 'http://localhost:3002';
        const res = await fetch(`${engineUrl}/stats`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const data = await res.json();
          setStats({
            builds: data.totalBuilds || 0,
            programs: data.programsDeployed || 0,
            sol: data.solEarned || 0,
          });
        }
      } catch {
        // Engine not reachable — keep defaults (0)
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <span className="text-6xl sm:text-8xl inline-block animate-pulse-slow">⚡</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-matrix-green to-matrix-purple bg-clip-text text-transparent">
            SolForge
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mb-4">
            Describe it. We build it. On Solana.
          </p>
          <p className="text-md text-gray-400 mb-8 max-w-2xl mx-auto">
            Autonomous AI agent that compiles, deploys, and verifies Solana programs from natural language specifications.
          </p>
          <Link
            href="/build"
            className="inline-block bg-matrix-green hover:bg-green-600 text-black font-bold px-8 py-4 rounded-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-matrix-green/50"
          >
            Request a Build →
          </Link>
        </div>

        {/* Animated Terminal */}
        <div className="glass-card p-6 mb-16 max-w-4xl mx-auto">
          <div className="flex items-center mb-4 space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-matrix-green"></div>
            <span className="text-gray-500 ml-4 text-sm">terminal</span>
          </div>
          <div className="terminal-output min-h-[300px] text-sm">
            {terminalLines.map((line, i) => (
              <div
                key={i}
                className={`mb-1 ${
                  line.includes('✓') ? 'text-matrix-green' : 
                  line.includes('$') ? 'text-matrix-purple' :
                  'text-gray-300'
                }`}
              >
                {line}
              </div>
            ))}
            {terminalLines.length > 0 && (
              <span className="inline-block w-2 h-4 bg-matrix-green animate-pulse ml-1"></span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
          <div className="glass-card-purple p-6 text-center">
            <div className="text-4xl font-bold text-matrix-purple mb-2">
              {stats.builds > 0 ? stats.builds.toLocaleString() : '✅'}
            </div>
            <div className="text-gray-400">{stats.builds > 0 ? 'Builds Completed' : 'Devnet Deployed'}</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-4xl font-bold text-matrix-green mb-2">
              {stats.programs > 0 ? stats.programs.toLocaleString() : '9/9'}
            </div>
            <div className="text-gray-400">{stats.programs > 0 ? 'Programs Deployed' : 'Tests Passing'}</div>
          </div>
          <div className="glass-card-purple p-6 text-center">
            <div className="text-4xl font-bold text-matrix-purple mb-2">
              {stats.sol > 0 ? `${stats.sol} SOL` : '🔓'}
            </div>
            <div className="text-gray-400">{stats.sol > 0 ? 'Earned by Agent' : 'Open Source'}</div>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-matrix-green">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Describe',
                description: 'Tell us what program you need in plain English',
                icon: '✍️',
              },
              {
                step: '2',
                title: 'Watch',
                description: 'See the AI reason through your spec and write code',
                icon: '👁️',
              },
              {
                step: '3',
                title: 'Verify',
                description: 'Every action is logged on-chain for transparency',
                icon: '✅',
              },
              {
                step: '4',
                title: 'Use',
                description: 'Get your deployed program ID and TypeScript SDK',
                icon: '🚀',
              },
            ].map((item) => (
              <div key={item.step} className="glass-card p-6 text-center hover:border-matrix-purple transition-all">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-matrix-green font-bold mb-2">
                  Step {item.step}
                </div>
                <div className="text-lg font-semibold mb-2">{item.title}</div>
                <div className="text-sm text-gray-400">{item.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">
            Ready to build on Solana with AI?
          </p>
          <Link
            href="/build"
            className="text-matrix-green hover:text-matrix-purple transition-colors font-semibold"
          >
            Start Building →
          </Link>
        </div>
      </div>
    </div>
  );
}
