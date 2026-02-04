import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl mb-6">⚠️</div>
        <h1 className="text-4xl font-bold text-matrix-green mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">
          This page doesn't exist on the Solana blockchain... or anywhere else.
        </p>
        <Link
          href="/"
          className="inline-block bg-matrix-green hover:bg-green-600 text-black font-bold px-6 py-3 rounded transition-all"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
