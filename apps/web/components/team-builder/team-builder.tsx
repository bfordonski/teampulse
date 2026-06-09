'use client';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { Loader2, Save, Sparkles, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CandidatePanel } from '@/components/candidates/candidate-panel';
import { DropColumn } from '@/components/team-builder/drop-column';
import { RoleSelect } from '@/components/team-builder/role-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import {
  DROP_ZONE_POOL,
  DROP_ZONE_TEAM,
  parseDragId,
  poolDragId,
  teamDragId,
} from '@/lib/constants';
import type { Candidate, Team } from '@/lib/types';

interface TeamBuilderProps {
  teamId?: string;
}

export function TeamBuilder({ teamId: initialTeamId }: TeamBuilderProps) {
  const router = useRouter();
  const [teamId, setTeamId] = useState<string | undefined>(initialTeamId);
  const [team, setTeam] = useState<Team | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allCandidates = await api.getCandidates();
      setCandidates(allCandidates);

      if (teamId) {
        const t = await api.getTeam(teamId);
        setTeam(t);
        setName(t.name);
        setDescription(t.description ?? '');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    load();
  }, [load]);

  const memberIds = useMemo(
    () => new Set(team?.members.map((m) => m.candidateId) ?? []),
    [team],
  );

  const teamCandidates = useMemo(
    () =>
      (team?.members ?? [])
        .map((m) => {
          const c = candidates.find((x) => x.id === m.candidateId);
          return c ? { candidate: c, member: m } : null;
        })
        .filter(Boolean) as Array<{
        candidate: Candidate;
        member: Team['members'][0];
      }>,
    [team, candidates],
  );

  const poolCandidates = useMemo(
    () => candidates.filter((c) => !memberIds.has(c.id)),
    [candidates, memberIds],
  );

  const activeCandidate = useMemo(() => {
    if (!activeDragId) return null;
    const { candidateId } = parseDragId(activeDragId);
    return candidates.find((c) => c.id === candidateId) ?? null;
  }, [activeDragId, candidates]);

  const ensureTeam = async (): Promise<string> => {
    if (teamId) return teamId;
    if (!name.trim()) {
      throw new Error('Enter a team name before adding members');
    }
    const created = await api.createTeam({
      name: name.trim(),
      description: description.trim() || undefined,
    });
    setTeamId(created.id);
    setTeam(created);
    router.replace(`/teams/${created.id}`);
    return created.id;
  };

  const saveTeamDetails = async () => {
    setBusy(true);
    setError(null);
    try {
      const id = await ensureTeam();
      const updated = await api.updateTeam(id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setTeam(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save team');
    } finally {
      setBusy(false);
    }
  };

  const addToTeam = async (candidateId: string, role = 'Developer') => {
    setBusy(true);
    setError(null);
    try {
      const id = await ensureTeam();
      const updated = await api.addMember(id, candidateId, role);
      setTeam(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add member');
    } finally {
      setBusy(false);
    }
  };

  const removeFromTeam = async (candidateId: string) => {
    if (!teamId) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await api.removeMember(teamId, candidateId);
      setTeam(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove member');
    } finally {
      setBusy(false);
    }
  };

  const changeRole = async (candidateId: string, role: string) => {
    if (!teamId) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await api.assignRole(teamId, candidateId, role);
      setTeam(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update role');
    } finally {
      setBusy(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || busy) return;

    const { zone: fromZone, candidateId } = parseDragId(String(active.id));
    const toZone = over.id === DROP_ZONE_TEAM ? 'team' : over.id === DROP_ZONE_POOL ? 'pool' : null;

    if (!toZone || fromZone === toZone) return;

    if (fromZone === 'pool' && toZone === 'team') {
      await addToTeam(candidateId);
    } else if (fromZone === 'team' && toZone === 'pool') {
      await removeFromTeam(candidateId);
    }
  };

  const handleActivate = async () => {
    if (!teamId) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await api.activateTeam(teamId);
      setTeam(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cannot activate team');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-8">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-xl">
          <CardHeader className="space-y-6 p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-indigo-200">Team builder</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
                  {teamId ? 'Edit team' : 'Create new team'}
                </h1>
              </div>
              {team && (
                <Badge
                  variant={team.status === 'ACTIVE' ? 'success' : 'secondary'}
                  className="border-white/20 bg-white/10 text-white"
                >
                  {team.status}
                </Badge>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-indigo-100">
                  Team name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Digital Squad"
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
                  disabled={team?.status === 'ARCHIVED'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-indigo-100">
                  Description
                </Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short pitch for this team"
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
                  disabled={team?.status === 'ARCHIVED'}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                onClick={saveTeamDetails}
                disabled={busy || team?.status === 'ARCHIVED'}
              >
                <Save className="h-4 w-4" />
                Save details
              </Button>
              {teamId && team?.status === 'DRAFT' && (
                <Button
                  type="button"
                  className="bg-emerald-500 hover:bg-emerald-600"
                  onClick={handleActivate}
                  disabled={busy || (team?.members.length ?? 0) === 0}
                >
                  <Sparkles className="h-4 w-4" />
                  Activate team
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Drag candidates between columns to add or remove team members. Use the grip handle on each
          card.
        </p>

        <div className="grid gap-8 lg:grid-cols-2">
          <DropColumn
            id={DROP_ZONE_TEAM}
            title="Team members"
            description="People assigned to this team"
            count={teamCandidates.length}
            accent="team"
          >
            {teamCandidates.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-center text-sm text-muted-foreground">
                <Users className="h-10 w-10 opacity-30" />
                <p>Drop candidates here to build your team</p>
              </div>
            ) : (
              teamCandidates.map(({ candidate, member }) => (
                <CandidatePanel
                  key={candidate.id}
                  candidate={candidate}
                  dragId={teamDragId(candidate.id)}
                  isDragging={activeDragId === teamDragId(candidate.id)}
                  footer={
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Role</span>
                      <div className="w-40">
                        <RoleSelect
                          value={member.role}
                          onChange={(role) => changeRole(candidate.id, role)}
                          disabled={busy || team?.status === 'ARCHIVED'}
                        />
                      </div>
                      {member.isLead && (
                        <Badge variant="default">Lead</Badge>
                      )}
                    </div>
                  }
                />
              ))
            )}
          </DropColumn>

          <DropColumn
            id={DROP_ZONE_POOL}
            title="Available candidates"
            description="Drag onto the team to assign"
            count={poolCandidates.length}
            accent="pool"
          >
            {poolCandidates.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground">
                <p>All candidates are on this team</p>
              </div>
            ) : (
              poolCandidates.map((candidate) => (
                <CandidatePanel
                  key={candidate.id}
                  candidate={candidate}
                  dragId={poolDragId(candidate.id)}
                  isDragging={activeDragId === poolDragId(candidate.id)}
                />
              ))
            )}
          </DropColumn>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeCandidate ? (
          <div className="w-[320px] rotate-2 opacity-95 shadow-panel-hover">
            <CandidatePanel
              candidate={activeCandidate}
              dragId="overlay"
            />
          </div>
        ) : null}
      </DragOverlay>

      {busy && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving…
        </div>
      )}
    </DndContext>
  );
}
