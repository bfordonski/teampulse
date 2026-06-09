import Link from 'next/link';
import { LayoutGrid, Users } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-sm text-white">
            CP
          </span>
          Consulting Platform
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/candidates"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LayoutGrid className="h-4 w-4" />
            Candidates
          </Link>
          <Link
            href="/teams"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Users className="h-4 w-4" />
            Teams
          </Link>
        </nav>
      </div>
    </header>
  );
}
