'use client';

import { Loader2, Plus, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CandidateForm } from '@/components/candidates/candidate-form';
import { CandidateListRow } from '@/components/candidates/candidate-list-row';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { AVAILABILITY_OPTIONS } from '@/lib/candidate-form-utils';
import type { Candidate, CreateCandidateInput, UpdateCandidateInput } from '@/lib/types';

const ALL_AVAILABILITY = 'ALL';

export function CandidateDirectory() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [availability, setAvailability] = useState(ALL_AVAILABILITY);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const hasActiveFilters =
    debouncedSearch.trim().length > 0 || availability !== ALL_AVAILABILITY;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const isInitial = isInitialLoad.current;
      if (isInitial) {
        setLoading(true);
        isInitialLoad.current = false;
      } else {
        setRefreshing(true);
      }
      setError(null);

      try {
        const list = await api.getCandidates({
          search: debouncedSearch.trim() || undefined,
          availability: availability !== ALL_AVAILABILITY ? availability : undefined,
        });
        if (cancelled) return;

        setCandidates(list);
        if (!hasActiveFilters) {
          setTotalCount(list.length);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, availability, hasActiveFilters]);

  const clearFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setAvailability(ALL_AVAILABILITY);
  };

  const handleCreate = async (data: CreateCandidateInput) => {
    const created = await api.createCandidate(data);
    setCandidates((prev) =>
      [...prev, created].sort((a, b) => a.fullName.localeCompare(b.fullName)),
    );
    setTotalCount((prev) => prev + 1);
  };

  const handleUpdate = async (data: UpdateCandidateInput) => {
    if (!editingCandidate) return;
    const updated = await api.updateCandidate(editingCandidate.id, data);
    setCandidates((prev) =>
      prev
        .map((c) => (c.id === updated.id ? updated : c))
        .sort((a, b) => a.fullName.localeCompare(b.fullName)),
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 -mx-1 space-y-3 rounded-lg border bg-background/95 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, skill, title, email…"
              className="pl-9 pr-9"
              aria-label="Search candidates"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Select value={availability} onValueChange={setAvailability}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_AVAILABILITY}>All availability</SelectItem>
              {AVAILABILITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            onClick={() => {
              setEditingCandidate(null);
              setFormMode('create');
            }}
          >
            <Plus className="h-4 w-4" />
            Add candidate
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {refreshing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {hasActiveFilters ? (
            <span>
              {candidates.length} of {totalCount} candidate
              {totalCount === 1 ? '' : 's'}
            </span>
          ) : (
            <span>
              {totalCount} candidate{totalCount === 1 ? '' : 's'} in the pool
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {totalCount === 0 && !hasActiveFilters ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
          <p>No candidates yet.</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => setFormMode('create')}
          >
            <Plus className="h-4 w-4" />
            Add your first candidate
          </Button>
        </div>
      ) : candidates.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
          <p>No candidates match your search.</p>
          <Button type="button" variant="outline" className="mt-4" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div
          className={`divide-y rounded-lg border bg-card ${refreshing ? 'opacity-60' : ''}`}
        >
          {candidates.map((c) => (
            <CandidateListRow
              key={c.id}
              candidate={c}
              onEdit={() => {
                setEditingCandidate(c);
                setFormMode('edit');
              }}
            />
          ))}
        </div>
      )}

      {formMode === 'create' && (
        <CandidateForm
          mode="create"
          open
          onClose={() => setFormMode(null)}
          onSave={handleCreate}
        />
      )}

      {formMode === 'edit' && editingCandidate && (
        <CandidateForm
          mode="edit"
          candidate={editingCandidate}
          open
          onClose={() => {
            setFormMode(null);
            setEditingCandidate(null);
          }}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}
