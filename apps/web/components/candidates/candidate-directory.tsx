'use client';

import { DndContext } from '@dnd-kit/core';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { CandidatePanel } from '@/components/candidates/candidate-panel';
import { api } from '@/lib/api';
import type { Candidate } from '@/lib/types';

export function CandidateDirectory() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getCandidates()
      .then(setCandidates)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error}
      </div>
    );
  }

  return (
    <DndContext>
      <div className="grid gap-4 sm:grid-cols-2">
        {candidates.map((c) => (
          <CandidatePanel key={c.id} candidate={c} draggable={false} />
        ))}
      </div>
    </DndContext>
  );
}
