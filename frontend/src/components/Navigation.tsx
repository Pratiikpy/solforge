'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  
  const links = [
    { href: '/', label: 'Home' },
    { href: '/build', label: 'Build' },
    { href: '/history', label: 'History' },
    { href: '/wallet', label: 'Wallet' },
    { href: '/api-docs', label: 'API' },
  ];
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-bold text-matrix-green group-hover:text-matrix-purple transition-colors">
            SolForge
          </span>
        </Link>
        
        <div className="flex space-x-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-matrix-purple ${
                pathname === link.href
                  ? 'text-matrix-green font-semibold'
                  : 'text-gray-400'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
