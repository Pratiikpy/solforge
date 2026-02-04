'use client';

import { useState, useEffect } from 'react';

interface Transaction {
  signature: string;
  type: 'payment_received' | 'deployment' | 'transfer';
  amount: number;
  timestamp: string;
  from?: string;
  to?: string;
}

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const agentWallet = 'SoLF0rG3A1gEn7W4LL3tAd9rE5sAb0uT1A2uT0n0M0u5';

  useEffect(() => {
    // Mock wallet data
    setBalance(142.5);

    const mockTransactions: Transaction[] = [
      {
        signature: '5VGpJ8KXtGzCpnZLHK9DpmA2k3W5rQzHqVGJ4wX9v8Y2Dpm7xKXt',
        type: 'payment_received',
        amount: 0.5,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        from: '7xKXtGzCpnZLHK9DpmA2k3W5rQzHqVGJ4wX9v8Y2Dpm',
      },
      {
        signature: '3BcDeF9pKLmnOqRsTuVwXyZ2A3bCdEfGhIjKlMnOpQrStUv4W9pK',
        type: 'deployment',
        amount: -0.2,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        to: 'Solana Program',
      },
      {
        signature: '7YzAbCdEfGhIjKlMnOpQrStUv4W9pKLmnOqRsTuVwXyZ2A3bCdE',
        type: 'payment_received',
        amount: 0.75,
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        from: '4HjKlMnOpQrStUv2W9xYzAbCdEfGhIjKlMnOpQrStUv',
      },
      {
        signature: '8NOpQrStUv4W9pKLmnOqRsTuVwXyZ2A3bCdEfGhIjKlMnOpQrS',
        type: 'deployment',
        amount: -0.15,
        timestamp: new Date(Date.now() - 21600000).toISOString(),
        to: 'Solana Program',
      },
      {
        signature: '2AbCdEfGhIjKlMnOpQrStUv3W4xYzAbCdEfGhIjKl8N9pK',
        type: 'payment_received',
        amount: 1.0,
        timestamp: new Date(Date.now() - 28800000).toISOString(),
        from: '2AbCdEfGhIjKlMnOpQrStUv3W4xYzAbCdEfGhIjKl8N',
      },
    ];

    setTransactions(mockTransactions);
  }, []);

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

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'payment_received':
        return '💰';
      case 'deployment':
        return '🚀';
      case 'transfer':
        return '↔️';
      default:
        return '•';
    }
  };

  const getTransactionLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'payment_received':
        return 'Payment Received';
      case 'deployment':
        return 'Program Deployment';
      case 'transfer':
        return 'Transfer';
      default:
        return 'Transaction';
    }
  };

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-matrix-green text-center">
          Agent Wallet
        </h1>

        {/* Wallet Card */}
        <div className="glass-card p-8 mb-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">👛</div>
            <h2 className="text-2xl font-bold text-matrix-green mb-2">
              SolForge Agent
            </h2>
            <p className="text-gray-400 text-sm">Autonomous Builder</p>
          </div>

          {/* Balance */}
          <div className="text-center mb-6 pb-6 border-b border-gray-800">
            <div className="text-sm text-gray-400 mb-2">Total Balance</div>
            <div className="text-5xl font-bold text-matrix-green mb-1">
              {balance.toFixed(2)} SOL
            </div>
            <div className="text-gray-500 text-sm">
              ≈ ${(balance * 100).toFixed(2)} USD
            </div>
          </div>

          {/* Wallet Address */}
          <div>
            <label className="text-sm text-gray-400 block mb-2">
              Wallet Address:
            </label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 bg-black border border-matrix-green/30 rounded px-4 py-3 text-matrix-green text-sm overflow-x-auto">
                {agentWallet}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(agentWallet)}
                className="bg-matrix-green hover:bg-green-600 text-black px-4 py-3 rounded font-semibold whitespace-nowrap"
              >
                Copy
              </button>
            </div>
            <a
              href={`https://explorer.solana.com/address/${agentWallet}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-matrix-purple hover:text-matrix-green text-sm"
            >
              View on Solana Explorer ↗
            </a>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-matrix-green mb-6">
            Recent Transactions
          </h3>

          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.signature}
                className="flex items-start space-x-4 pb-4 border-b border-gray-800 last:border-b-0"
              >
                <div className="text-2xl">{getTransactionIcon(tx.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-300">
                      {getTransactionLabel(tx.type)}
                    </span>
                    <span
                      className={`font-bold ${
                        tx.amount > 0 ? 'text-matrix-green' : 'text-red-400'
                      }`}
                    >
                      {tx.amount > 0 ? '+' : ''}
                      {tx.amount.toFixed(2)} SOL
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    {formatTimestamp(tx.timestamp)}
                  </div>
                  {tx.from && (
                    <div className="text-xs text-gray-600">
                      From: {tx.from.slice(0, 8)}...{tx.from.slice(-8)}
                    </div>
                  )}
                  {tx.to && (
                    <div className="text-xs text-gray-600">To: {tx.to}</div>
                  )}
                  <a
                    href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-matrix-purple hover:text-matrix-green mt-1 inline-block"
                  >
                    View Transaction ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="glass-card-purple p-4 text-center">
            <div className="text-2xl font-bold text-matrix-purple mb-1">
              {transactions.filter((tx) => tx.amount > 0).length}
            </div>
            <div className="text-sm text-gray-400">Payments Received</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-matrix-green mb-1">
              {transactions.filter((tx) => tx.type === 'deployment').length}
            </div>
            <div className="text-sm text-gray-400">Programs Deployed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
