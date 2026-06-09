'use client';

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DropColumnProps {
  id: string;
  title: string;
  description: string;
  count: number;
  children: React.ReactNode;
  accent?: 'team' | 'pool';
}

export function DropColumn({
  id,
  title,
  description,
  count,
  children,
  accent = 'pool',
}: DropColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <section className="flex min-h-[480px] flex-1 flex-col">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-medium',
              accent === 'team'
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {count}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-1 flex-col gap-3 rounded-2xl border-2 border-dashed p-4 transition-colors',
          accent === 'team'
            ? 'border-primary/20 bg-primary/[0.02]'
            : 'border-border bg-muted/30',
          isOver &&
            (accent === 'team'
              ? 'border-primary bg-primary/5'
              : 'border-amber-400/60 bg-amber-50/50'),
        )}
      >
        {children}
      </div>
    </section>
  );
}
