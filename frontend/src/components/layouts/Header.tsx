'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Building2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Accueil' },
  { href: '/estimation', label: 'Estimer' },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <Building2 className="size-5 text-primary" />
          <span className="hidden sm:inline">EstimerMonImmeuble</span>
          <span className="sm:hidden">EMI</span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-colors',
                pathname === item.href
                  ? 'text-primary font-medium bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA desktop */}
        <div className="hidden md:block">
          <Button asChild size="sm">
            <Link href="/estimation">Estimer gratuitement</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'block px-3 py-2 text-sm rounded-md transition-colors',
                pathname === item.href
                  ? 'text-primary font-medium bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2">
            <Button asChild className="w-full" size="sm">
              <Link href="/estimation" onClick={() => setMobileOpen(false)}>Estimer gratuitement</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
