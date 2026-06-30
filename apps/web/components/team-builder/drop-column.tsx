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
  scrollable?: boolean;
  toolbar?: React.ReactNode;
  headerAction?: React.ReactNode;
  layout?: 'list' | 'grid';
  compact?: boolean;
}

export function DropColumn({
  id,
  title,
  description,
  count,
  children,
  accent = 'pool',
  scrollable = false,
  toolbar,
  headerAction,
  layout = 'list',
  compact = false,
}: DropColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <section
      className={cn(
        'flex flex-1 flex-col',
        compact ? 'min-h-0 h-full' : 'min-h-[480px]',
      )}
    >
      {!compact && (
        <div className="mb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
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
            {headerAction}
          </div>
        </div>
      )}

      {toolbar}

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 rounded-2xl border-2 border-dashed p-4 transition-colors',
          layout === 'grid'
            ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
            : 'flex flex-col gap-3',
          accent === 'team'
            ? 'border-primary/20 bg-primary/[0.02]'
            : 'border-border bg-muted/30',
          isOver &&
            (accent === 'team'
              ? 'border-primary bg-primary/5'
              : 'border-amber-400/60 bg-amber-50/50'),
          scrollable && 'min-h-0 overflow-y-auto',
          compact && 'min-h-0 flex-1',
          !compact && scrollable && 'max-h-[min(70vh,720px)]',
        )}
      >
        {children}
      </div>
    </section>
  );
}
