'use client';

import { PanelRightClose } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CandidatePoolDrawerProps {
  open: boolean;
  onClose: () => void;
  count: number;
  children: React.ReactNode;
}

export function CandidatePoolDrawer({
  open,
  onClose,
  count,
  children,
}: CandidatePoolDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  return (
    <>
      <div
        role="presentation"
        aria-hidden={!open}
        className={cn(
          'fixed inset-0 z-30 bg-black/40 transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />

      <aside
        aria-label="Available candidates"
        aria-hidden={!open}
        className={cn(
          'fixed inset-y-0 right-0 z-40 flex w-full max-w-[420px] flex-col border-l bg-background shadow-xl transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'pointer-events-none translate-x-full',
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight">Available candidates</h2>
            <p className="text-sm text-muted-foreground">
              {count} available · drag onto the team or use View
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            aria-label="Close candidate pool"
          >
            <PanelRightClose className="h-4 w-4" />
            Hide
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">{children}</div>
      </aside>
    </>
  );
}
