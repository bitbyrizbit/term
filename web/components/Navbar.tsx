"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === '/';

  if (isLanding) return null;

  const navItems = [
    { key: '/dashboard', label: 'Portfolio' },
    { key: '/upload', label: 'Ingest' },
  ];

  // Check if we are inside a specific contract
  const match = pathname.match(/^\/contracts\/([^/]+)/);
  const contractId = match ? match[1] : null;

  if (contractId) {
    navItems.push({ key: `/contracts/${contractId}`, label: 'Document' });
    navItems.push({ key: `/contracts/${contractId}/obligations`, label: 'Obligations' });
    navItems.push({ key: `/contracts/${contractId}/simulate`, label: 'Simulator' });
    navItems.push({ key: `/contracts/${contractId}/graph`, label: 'Graph' });
    navItems.push({ key: `/contracts/${contractId}/diff`, label: 'Diff' });
    navItems.push({ key: `/contracts/${contractId}/risk`, label: 'Risk' });
  }

  return (
    <header className="sticky top-0 z-50 bg-paper-100/90 backdrop-blur-sm border-b border-ink-200">
      <div className="max-w-8xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="font-display text-2xl tracking-tighter2 text-ink-900 leading-none">
            TERM
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400 hidden sm:inline group-hover:text-clay-500 transition-colors">
            Between the words and what follows.
          </span>
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.key}
              className={`whitespace-nowrap px-3.5 py-2 text-sm font-medium rounded-sm transition-colors duration-150 ${
                pathname === item.key
                  ? 'text-ink-900 bg-ink-100'
                  : 'text-ink-500 hover:text-ink-800 hover:bg-ink-100/60'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-ink-400 hidden md:inline">v1.0.0</span>
          
        </div>
      </div>
    </header>
  );
}

