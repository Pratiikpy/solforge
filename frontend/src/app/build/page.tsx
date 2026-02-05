'use client';

import { useState, useRef, useEffect } from 'react';

interface ProgressEvent {
  type: 'progress';
  step: number;
  total: number;
  description: string;
}

interface CodeEvent {
  type: 'code';
  file: string;
  content: string;
}

interface TerminalEvent {
  type: 'terminal';
  output: string;
}

interface ChainEvent {
  type: 'chain';
  label: string;
  txSignature: string;
  explorerUrl: string;
}

interface CompleteEvent {
  type: 'complete';
  programId: string;
  programName: string;
  sdk: string;
  chainTxs: { signature: string; explorer: string }[];
}

interface ErrorEvent {
  type: 'error';
  error: string;
}

interface ResultEvent {
  type: 'result';
  success: boolean;
  programId?: string;
  programName?: string;
  sdk?: string;
  error?: string;
}

type BuildEvent = ProgressEvent | CodeEvent | TerminalEvent | ChainEvent | CompleteEvent | ErrorEvent | ResultEvent;

export default function BuildPage() {
  const [spec, setSpec] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [events, setEvents] = useState<BuildEvent[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(7);
  const [stepDesc, setStepDesc] = useState('');
  const [programId, setProgramId] = useState('');
  const [programName, setProgramName] = useState('');
  const [sdk, setSdk] = useState('');
  const [error, setError] = useState('');
  const [chainTxs, setChainTxs] = useState<{ signature: string; explorer: string }[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const chainRef = useRef<HTMLDivElement>(null);

  const examplePrompts = [
    'Build a simple counter program with increment and decrement',
    'Create a token vesting program with cliff periods',
    'Build an NFT staking contract with rewards',
    'Create a DAO voting system with proposals',
    'Build a prediction market with binary outcomes',
    'Create a crowdfunding escrow contract',
  ];

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
    if (chainRef.current) {
      chainRef.current.scrollTop = chainRef.current.scrollHeight;
    }
  }, [events]);

  const startBuild = async () => {
    if (!spec.trim()) return;

    setIsBuilding(true);
    setEvents([]);
    setCurrentStep(0);
    setTotalSteps(7);
    setStepDesc('');
    setProgramId('');
    setProgramName('');
    setSdk('');
    setError('');
    setChainTxs([]);

    try {
      const response = await fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec }),
      });

      if (!response.body) {
        setError('No response stream');
        setIsBuilding(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6)) as BuildEvent;
            setEvents((prev) => [...prev, event]);

            switch (event.type) {
              case 'progress':
                setCurrentStep(event.step);
                setTotalSteps(event.total);
                setStepDesc(event.description);
                break;
              case 'chain':
                setChainTxs((prev) => [
                  ...prev,
                  { signature: event.txSignature, explorer: event.explorerUrl },
                ]);
                break;
              case 'complete':
                setProgramId(event.programId);
                setProgramName(event.programName);
                setSdk(event.sdk);
                if (event.chainTxs) {
                  setChainTxs((prev) => [...prev, ...event.chainTxs]);
                }
                break;
              case 'result':
                if (event.success) {
                  setProgramId(event.programId || '');
                  setProgramName(event.programName || '');
                  if (event.sdk) setSdk(event.sdk);
                } else {
                  setError(event.error || 'Build failed');
                }
                setIsBuilding(false);
                break;
              case 'error':
                setError(event.error);
                setIsBuilding(false);
                break;
            }
          } catch {
            // skip malformed lines
          }
        }
      }

      setIsBuilding(false);
    } catch (err: any) {
      setError(err.message || 'Connection failed');
      setIsBuilding(false);
    }
  };

  const progressPercent = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;
  const codeEvents = events.filter((e): e is CodeEvent => e.type === 'code');
  const terminalEvents = events.filter((e): e is TerminalEvent => e.type === 'terminal');
  const progressEvents = events.filter((e): e is ProgressEvent => e.type === 'progress');

  const resetBuild = () => {
    setEvents([]);
    setCurrentStep(0);
    setStepDesc('');
    setProgramId('');
    setProgramName('');
    setSdk('');
    setError('');
    setChainTxs([]);
    setSpec('');
  };

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-matrix-green text-center">
          ⚡ Build on Solana
        </h1>

        {/* Input Section */}
        {!isBuilding && events.length === 0 && (
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
              />
              <button
                onClick={startBuild}
                disabled={!spec.trim()}
                className="mt-4 w-full bg-matrix-green hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-bold px-6 py-3 rounded transition-all"
              >
                Start Build →
              </button>
            </div>

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
        {(isBuilding || events.length > 0) && (
          <>
            {/* Progress Bar */}
            <div className="max-w-3xl mx-auto mb-6">
              <div className="glass-card p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">
                    {stepDesc || `Step ${currentStep}/${totalSteps}`}
                  </span>
                  <span className="text-sm text-matrix-green">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-matrix-green to-matrix-purple transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Steps Log + Terminal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {/* Steps / Progress Log */}
              <div className="glass-card p-4">
                <h3 className="text-lg font-semibold text-matrix-purple mb-3">
                  🧠 Build Steps
                </h3>
                <div className="h-96 overflow-y-auto text-sm space-y-2">
                  {progressEvents.map((event, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <span className="text-matrix-green font-bold min-w-[3ch]">
                        [{event.step}/{event.total}]
                      </span>
                      <span className="text-gray-300">{event.description}</span>
                    </div>
                  ))}
                  {isBuilding && (
                    <div className="flex items-center space-x-2 text-matrix-purple">
                      <span className="animate-pulse">●</span>
                      <span>Working...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Terminal Output */}
              <div className="glass-card p-4">
                <h3 className="text-lg font-semibold text-matrix-green mb-3">
                  ⚡ Terminal
                </h3>
                <div
                  ref={terminalRef}
                  className="terminal-output h-96 overflow-y-auto text-xs"
                >
                  {terminalEvents.map((event, i) => (
                    <div key={i} className="mb-2 text-gray-300 whitespace-pre-wrap">
                      {event.output}
                    </div>
                  ))}
                  {isBuilding && terminalEvents.length === 0 && (
                    <div className="text-gray-500 italic">Waiting for output...</div>
                  )}
                </div>
              </div>
            </div>

            {/* Code + Chain Verification */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Code Preview */}
              <div className="glass-card p-4">
                <h3 className="text-lg font-semibold text-matrix-green mb-3">
                  📝 Generated Code
                </h3>
                <div className="terminal-output h-64 overflow-y-auto text-xs">
                  {codeEvents.length === 0 && (
                    <div className="text-gray-500 italic">
                      {isBuilding ? 'Generating...' : 'No code generated'}
                    </div>
                  )}
                  {codeEvents.map((event, i) => (
                    <div key={i} className="mb-4">
                      <div className="text-matrix-purple font-bold mb-1">
                        📄 {event.file}
                      </div>
                      <pre className="text-gray-300 whitespace-pre-wrap">
                        {event.content}
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
                <div ref={chainRef} className="space-y-3 h-64 overflow-y-auto text-sm">
                  {chainTxs.length === 0 && (
                    <div className="text-gray-500 italic">
                      {isBuilding ? 'Logging to Solana...' : 'No chain events'}
                    </div>
                  )}
                  {chainTxs.map((tx, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <span className="text-matrix-green">✓</span>
                      <div className="flex-1">
                        <code className="text-gray-300 text-xs break-all">
                          {tx.signature.slice(0, 20)}...{tx.signature.slice(-8)}
                        </code>
                        <a
                          href={tx.explorer}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-matrix-purple hover:text-matrix-green text-xs mt-1"
                        >
                          View on Explorer ↗
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="max-w-3xl mx-auto mt-6 glass-card p-6 border-red-500 border">
                <h3 className="text-xl font-bold text-red-400 mb-2">❌ Build Failed</h3>
                <p className="text-gray-300 text-sm">{error}</p>
                <button
                  onClick={resetBuild}
                  className="mt-4 bg-matrix-green hover:bg-green-600 text-black font-bold px-6 py-2 rounded"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Completion Card */}
            {programId && !isBuilding && (
              <div className="max-w-3xl mx-auto mt-6 glass-card p-6 border-matrix-green border">
                <h3 className="text-2xl font-bold text-matrix-green mb-4">
                  ✨ Build Complete!
                </h3>
                {programName && (
                  <p className="text-gray-400 mb-4">
                    Program: <span className="text-matrix-purple font-semibold">{programName}</span>
                  </p>
                )}
                <div className="mb-4">
                  <label className="text-sm text-gray-400 block mb-1">
                    Program ID:
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-black border border-matrix-green/30 rounded px-4 py-2 text-matrix-green text-sm overflow-x-auto">
                      {programId}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(programId)}
                      className="bg-matrix-green hover:bg-green-600 text-black px-4 py-2 rounded font-semibold text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {chainTxs.length > 0 && (
                  <div className="mb-4">
                    <label className="text-sm text-gray-400 block mb-2">
                      On-Chain Logs ({chainTxs.length} transactions):
                    </label>
                    <div className="space-y-1">
                      {chainTxs.slice(-3).map((tx, i) => (
                        <a
                          key={i}
                          href={tx.explorer}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-matrix-purple hover:text-matrix-green text-xs"
                        >
                          ✓ {tx.signature.slice(0, 24)}... ↗
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <a
                    href={`https://explorer.solana.com/address/${programId}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-matrix-purple hover:bg-purple-600 text-white px-6 py-2 rounded font-semibold text-sm"
                  >
                    View on Explorer ↗
                  </a>
                  {sdk && (
                    <button
                      onClick={() => {
                        const blob = new Blob([sdk], { type: 'text/typescript' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${programName || 'program'}-sdk.ts`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="bg-black border border-matrix-green hover:bg-matrix-green hover:text-black text-matrix-green px-6 py-2 rounded font-semibold text-sm transition-all"
                    >
                      Download SDK
                    </button>
                  )}
                  <button
                    onClick={resetBuild}
                    className="bg-black border border-gray-600 hover:border-matrix-purple text-gray-400 hover:text-matrix-purple px-6 py-2 rounded font-semibold text-sm transition-all"
                  >
                    New Build
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
