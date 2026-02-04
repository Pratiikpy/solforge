'use client';

import { useState, useRef, useEffect } from 'react';

interface BuildEvent {
  type: 'status' | 'thinking' | 'code' | 'terminal' | 'progress' | 'chain_log' | 'complete' | 'error';
  data: any;
}

export default function BuildPage() {
  const [spec, setSpec] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildEvents, setBuildEvents] = useState<BuildEvent[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [programId, setProgramId] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);
  const reasoningRef = useRef<HTMLDivElement>(null);

  const examplePrompts = [
    "Build a token vesting program with cliff periods",
    "Create an NFT staking contract with rewards",
    "Build a DAO voting system with proposal execution",
    "Create a token swap program with liquidity pools",
    "Build a prediction market with binary outcomes",
    "Create a crowdfunding escrow contract",
  ];

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
    if (reasoningRef.current) {
      reasoningRef.current.scrollTop = reasoningRef.current.scrollHeight;
    }
  }, [buildEvents]);

  const startBuild = async () => {
    if (!spec.trim()) return;
    
    setIsBuilding(true);
    setBuildEvents([]);
    setProgress(0);
    setCurrentStep(1);
    setProgramId('');

    try {
      const response = await fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6)) as BuildEvent;
              setBuildEvents((prev) => [...prev, event]);

              if (event.type === 'progress') {
                setProgress(event.data.percent);
                setCurrentStep(event.data.step);
              }

              if (event.type === 'complete') {
                setProgramId(event.data.programId);
                setIsBuilding(false);
              }

              if (event.type === 'error') {
                setIsBuilding(false);
              }
            } catch (e) {
              console.error('Failed to parse event:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Build failed:', error);
      setBuildEvents((prev) => [
        ...prev,
        { type: 'error', data: { message: 'Connection failed' } },
      ]);
      setIsBuilding(false);
    }
  };

  const thinkingEvents = buildEvents.filter((e) => e.type === 'thinking');
  const terminalEvents = buildEvents.filter((e) => e.type === 'terminal');
  const codeEvents = buildEvents.filter((e) => e.type === 'code');
  const chainEvents = buildEvents.filter((e) => e.type === 'chain_log');

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-matrix-green text-center">
          Build on Solana with AI
        </h1>

        {/* Input Section */}
        {!isBuilding && buildEvents.length === 0 && (
          <div className="max-w-3xl mx-auto mb-12">
            <div className="glass-card p-6 mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                Describe your Solana program:
              </label>
              <textarea
                value={spec}
                onChange={(e) => setSpec(e.target.value)}
                placeholder="Build a token vesting program with cliff periods..."
                className="w-full h-32 bg-black border border-matrix-green/30 rounded px-4 py-3 text-matrix-green focus:outline-none focus:border-matrix-green resize-none"
                disabled={isBuilding}
              />
              <button
                onClick={startBuild}
                disabled={!spec.trim() || isBuilding}
                className="mt-4 w-full bg-matrix-green hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-bold px-6 py-3 rounded transition-all"
              >
                {isBuilding ? 'Building...' : 'Start Build →'}
              </button>
            </div>

            {/* Example Prompts */}
            <div>
              <p className="text-sm text-gray-400 mb-3">Try these examples:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {examplePrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setSpec(prompt)}
                    className="glass-card px-4 py-3 text-left text-sm hover:border-matrix-purple transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Building Interface */}
        {(isBuilding || buildEvents.length > 0) && (
          <>
            {/* Progress Bar */}
            <div className="max-w-3xl mx-auto mb-6">
              <div className="glass-card p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">
                    Step {currentStep}/7
                  </span>
                  <span className="text-sm text-matrix-green">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-matrix-green to-matrix-purple transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Split Screen */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {/* AI Reasoning */}
              <div className="glass-card p-4">
                <h3 className="text-lg font-semibold text-matrix-purple mb-3">
                  🧠 AI Reasoning
                </h3>
                <div
                  ref={reasoningRef}
                  className="terminal-output h-96 overflow-y-auto text-sm"
                >
                  {thinkingEvents.map((event, i) => (
                    <div key={i} className="mb-2 text-gray-300">
                      {event.data.message}
                    </div>
                  ))}
                  {isBuilding && thinkingEvents.length > 0 && (
                    <span className="inline-block w-2 h-4 bg-matrix-purple animate-pulse"></span>
                  )}
                </div>
              </div>

              {/* Terminal Output */}
              <div className="glass-card p-4">
                <h3 className="text-lg font-semibold text-matrix-green mb-3">
                  ⚡ Terminal Output
                </h3>
                <div
                  ref={terminalRef}
                  className="terminal-output h-96 overflow-y-auto text-sm"
                >
                  {terminalEvents.map((event, i) => (
                    <div
                      key={i}
                      className={`mb-1 ${
                        event.data.level === 'error'
                          ? 'text-red-400'
                          : event.data.level === 'success'
                          ? 'text-matrix-green'
                          : 'text-gray-300'
                      }`}
                    >
                      {event.data.message}
                    </div>
                  ))}
                  {isBuilding && terminalEvents.length > 0 && (
                    <span className="inline-block w-2 h-4 bg-matrix-green animate-pulse"></span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Code Preview */}
              <div className="glass-card p-4">
                <h3 className="text-lg font-semibold text-matrix-green mb-3">
                  📝 Code Preview
                </h3>
                <div className="terminal-output h-64 overflow-y-auto text-xs">
                  {codeEvents.map((event, i) => (
                    <div key={i} className="mb-4">
                      <div className="text-matrix-purple mb-1">
                        {event.data.file}
                      </div>
                      <pre className="text-gray-300 whitespace-pre-wrap">
                        {event.data.content}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>

              {/* On-Chain Verification */}
              <div className="glass-card-purple p-4">
                <h3 className="text-lg font-semibold text-matrix-purple mb-3">
                  ✅ On-Chain Verification
                </h3>
                <div className="space-y-2 h-64 overflow-y-auto text-sm">
                  {chainEvents.map((event, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <span className="text-matrix-green animate-pulse-slow">
                        •
                      </span>
                      <div className="flex-1">
                        <div className="text-gray-300">{event.data.action}</div>
                        <a
                          href={`https://explorer.solana.com/tx/${event.data.signature}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-matrix-purple hover:text-matrix-green text-xs"
                        >
                          Verify ↗
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Completion Card */}
            {programId && (
              <div className="max-w-3xl mx-auto mt-6 glass-card p-6 border-matrix-green">
                <h3 className="text-2xl font-bold text-matrix-green mb-4">
                  ✨ Build Complete!
                </h3>
                <div className="mb-4">
                  <label className="text-sm text-gray-400 block mb-1">
                    Program ID:
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-black border border-matrix-green/30 rounded px-4 py-2 text-matrix-green text-sm">
                      {programId}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(programId)}
                      className="bg-matrix-green hover:bg-green-600 text-black px-4 py-2 rounded font-semibold"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <a
                    href={`https://explorer.solana.com/address/${programId}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-matrix-purple hover:bg-purple-600 text-white px-6 py-2 rounded font-semibold"
                  >
                    View on Explorer ↗
                  </a>
                  <button className="bg-black border border-matrix-green hover:bg-matrix-green hover:text-black text-matrix-green px-6 py-2 rounded font-semibold transition-all">
                    Download SDK
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
