'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  
  const links = [
    { href: '/', label: 'Home' },
    { href: '/build', label: 'Build' },
    { href: '/api-docs', label: 'API' },
  ];
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-purple-500 flex items-center justify-center text-sm font-bold text-black">
            ⚡
          </div>
          <span className="text-lg font-bold text-white group-hover:text-green-500 transition-colors">
            SolForge
          </span>
        </Link>
        
        <div className="flex items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === link.href
                  ? 'text-green-500 bg-green-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/build"
            className="ml-2 px-5 py-2 rounded-lg text-sm font-semibold bg-green-500 text-black hover:bg-green-400 transition-all hover:shadow-lg hover:shadow-green-500/20"
          >
            Start Building
          </Link>
        </div>
      </div>
    </nav>
  );
}
