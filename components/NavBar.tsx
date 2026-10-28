'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Brain, BarChart2, Settings } from 'lucide-react';
import Logo from './Logo';

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/subjects', label: 'Subjects', icon: BookOpen },
  { href: '/tutor', label: 'AI Tutor', icon: Brain },
  { href: '/progress', label: 'Progress', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop top bar ────────────────────────────────── */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b border-slate-100 shadow-sm items-center px-6 gap-8">
        <Link href="/" aria-label="ShikshaMitra AI home">
          <Logo size="sm" />
        </Link>
        <nav className="flex items-center gap-1 flex-1" aria-label="Main navigation">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-150 ${
                  active
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="text-xs text-slate-400 font-medium">Grade 4 Demo</div>
      </header>

      {/* ── Mobile bottom bar ─────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 flex items-stretch"
        aria-label="Mobile navigation"
      >
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-semibold transition-colors ${
                active ? 'text-violet-700' : 'text-slate-400'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-violet-600' : 'text-slate-400'}`} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
