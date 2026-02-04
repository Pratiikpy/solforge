'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Build {
  id: string;
  spec: string;
  status: 'completed' | 'failed' | 'building';
  programId?: string;
  duration: number;
  timestamp: string;
  signature?: string;
}

export default function HistoryPage() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    avgTime: 0,
  });

  useEffect(() => {
    // Mock build history data
    const mockBuilds: Build[] = [
      {
        id: '1',
        spec: 'Build a token vesting program with cliff periods',
        status: 'completed',
        programId: '7xKXtGzCpnZLHK9DpmA2k3W5rQzHqVGJ4wX9v8Y2Dpm',
        duration: 47.2,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        signature: '5VGpJ8KXtGzCpnZLHK9DpmA2k3W5rQzHqVGJ4wX9v8Y2Dpm7xKXt',
      },
      {
        id: '2',
        spec: 'Create an NFT staking contract with rewards',
        status: 'completed',
        programId: '9pKLmnOqRsTuVwXyZ2A3bCdEfGhIjKlMnOpQrStUv4W',
        duration: 52.8,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        signature: '3BcDeF9pKLmnOqRsTuVwXyZ2A3bCdEfGhIjKlMnOpQrStUv4W9pK',
      },
      {
        id: '3',
        spec: 'Build a DAO voting system with proposal execution',
        status: 'completed',
        programId: '4HjKlMnOpQrStUv2W9xYzAbCdEfGhIjKlMnOpQrStUv',
        duration: 61.5,
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        signature: '7YzAbCdEfGhIjKlMnOpQrStUv4W9pKLmnOqRsTuVwXyZ2A3bCdE',
      },
      {
        id: '4',
        spec: 'Create a token swap program with liquidity pools',
        status: 'failed',
        duration: 23.1,
        timestamp: new Date(Date.now() - 21600000).toISOString(),
      },
      {
        id: '5',
        spec: 'Build a prediction market with binary outcomes',
        status: 'completed',
        programId: '2AbCdEfGhIjKlMnOpQrStUv3W4xYzAbCdEfGhIjKl8N',
        duration: 55.3,
        timestamp: new Date(Date.now() - 28800000).toISOString(),
        signature: '8NOpQrStUv4W9pKLmnOqRsTuVwXyZ2A3bCdEfGhIjKlMnOpQrS',
      },
    ];

    setBuilds(mockBuilds);

    // Calculate stats
    const completed = mockBuilds.filter((b) => b.status === 'completed');
    const avgTime =
      completed.reduce((sum, b) => sum + b.duration, 0) / completed.length;

    setStats({
      total: mockBuilds.length,
      success: completed.length,
      avgTime: parseFloat(avgTime.toFixed(1)),
    });
  }, []);

  const getStatusColor = (status: Build['status']) => {
    switch (status) {
      case 'completed':
        return 'text-matrix-green';
      case 'failed':
        return 'text-red-400';
      case 'building':
        return 'text-matrix-purple';
      default:
        return 'text-gray-400';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-matrix-green text-center">
          Build History
        </h1>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="glass-card p-6 text-center">
            <div className="text-4xl font-bold text-matrix-green mb-2">
              {stats.total}
            </div>
            <div className="text-gray-400">Total Builds</div>
          </div>
          <div className="glass-card-purple p-6 text-center">
            <div className="text-4xl font-bold text-matrix-purple mb-2">
              {stats.success > 0
                ? ((stats.success / stats.total) * 100).toFixed(0)
                : 0}
              %
            </div>
            <div className="text-gray-400">Success Rate</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-4xl font-bold text-matrix-green mb-2">
              {stats.avgTime}s
            </div>
            <div className="text-gray-400">Avg Build Time</div>
          </div>
        </div>

        {/* Build List */}
        <div className="space-y-4">
          {builds.map((build) => (
            <div key={build.id} className="glass-card p-6 hover:border-matrix-purple transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                <div className="flex-1 mb-4 lg:mb-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <span
                      className={`text-sm font-semibold ${getStatusColor(
                        build.status
                      )}`}
                    >
                      {build.status.toUpperCase()}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400 text-sm">
                      {formatTimestamp(build.timestamp)}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400 text-sm">
                      {build.duration}s
                    </span>
                  </div>
                  <p className="text-gray-300">{build.spec}</p>
                </div>
                {build.status === 'completed' && build.programId && (
                  <div className="flex space-x-2">
                    <a
                      href={`https://explorer.solana.com/address/${build.programId}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-matrix-purple hover:bg-purple-600 text-white px-4 py-2 rounded font-semibold text-sm whitespace-nowrap"
                    >
                      View Program ↗
                    </a>
                  </div>
                )}
              </div>

              {build.programId && (
                <div className="border-t border-gray-800 pt-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 block mb-1">
                        Program ID:
                      </label>
                      <code className="text-sm text-matrix-green">
                        {build.programId}
                      </code>
                    </div>
                    {build.signature && (
                      <a
                        href={`https://explorer.solana.com/tx/${build.signature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-matrix-green hover:text-matrix-purple text-sm flex items-center"
                      >
                        <span className="animate-pulse-slow mr-1">✓</span>
                        Verified on Solana ↗
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {builds.length === 0 && (
          <div className="glass-card p-12 text-center">
            <p className="text-gray-400 mb-4">No builds yet</p>
            <Link
              href="/build"
              className="text-matrix-green hover:text-matrix-purple font-semibold"
            >
              Start your first build →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
