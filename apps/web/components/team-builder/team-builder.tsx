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
import { Loader2, PanelRightOpen, Pencil, Save, Search, Sparkles, UserMinus, Users, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CandidatePanel } from '@/components/candidates/candidate-panel';
import { CandidatePoolRow } from '@/components/candidates/candidate-pool-row';
import { CandidateProfilePreview } from '@/components/candidates/candidate-profile-preview';
import { CandidatePoolDrawer } from '@/components/team-builder/candidate-pool-drawer';
import { DropColumn } from '@/components/team-builder/drop-column';
import { RoleSelect } from '@/components/team-builder/role-select';
import { TeamMemberProfileForm } from '@/components/team-builder/team-member-profile-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { candidateMatchesSearch } from '@/lib/candidate-search';
import {
  DROP_ZONE_POOL,
  DROP_ZONE_TEAM,
  parseDragId,
  poolDragId,
  teamDragId,
} from '@/lib/constants';
import type { Candidate, Team, TeamMember, UpdateTeamMemberProfileInput } from '@/lib/types';

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
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [poolSearch, setPoolSearch] = useState('');
  const [previewCandidate, setPreviewCandidate] = useState<Candidate | null>(null);
  const [addingFromPreview, setAddingFromPreview] = useState(false);
  const [poolOpen, setPoolOpen] = useState(false);

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

  const memberSourceIds = useMemo(
    () =>
      new Set(
        team?.members.map((m) => m.sourceCandidateId ?? m.candidateId) ?? [],
      ),
    [team],
  );

  const teamMembers = useMemo(() => team?.members ?? [], [team]);

  const poolCandidates = useMemo(
    () => candidates.filter((c) => !memberSourceIds.has(c.id)),
    [candidates, memberSourceIds],
  );

  const filteredPoolCandidates = useMemo(
    () => poolCandidates.filter((c) => candidateMatchesSearch(c, poolSearch)),
    [poolCandidates, poolSearch],
  );

  const activeCandidate = useMemo(() => {
    if (!activeDragId) return null;
    const { zone, candidateId } = parseDragId(activeDragId);
    if (zone === 'team') {
      const member = teamMembers.find(
        (m) => (m.sourceCandidateId ?? m.candidateId) === candidateId,
      );
      return member?.profile ?? null;
    }
    return candidates.find((c) => c.id === candidateId) ?? null;
  }, [activeDragId, candidates, teamMembers]);

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

  const addToTeam = async (candidateId: string, role = 'Developer'): Promise<boolean> => {
    setBusy(true);
    setError(null);
    try {
      const id = await ensureTeam();
      const updated = await api.addMember(id, candidateId, role);
      setTeam(updated);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add member');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const removeFromTeam = async (sourceCandidateId: string) => {
    if (!teamId) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await api.removeMember(teamId, sourceCandidateId);
      setTeam(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove member');
    } finally {
      setBusy(false);
    }
  };

  const changeRole = async (sourceCandidateId: string, role: string) => {
    if (!teamId) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await api.assignRole(teamId, sourceCandidateId, role);
      setTeam(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update role');
    } finally {
      setBusy(false);
    }
  };

  const saveMemberProfile = async (
    memberId: string,
    data: UpdateTeamMemberProfileInput,
  ) => {
    if (!teamId) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await api.updateMemberProfile(teamId, memberId, data);
      setTeam(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update profile');
      throw e;
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

  const handleAddFromPreview = async () => {
    if (!previewCandidate) return;
    setAddingFromPreview(true);
    try {
      const ok = await addToTeam(previewCandidate.id);
      if (ok) {
        setPreviewCandidate(null);
        setPoolOpen(false);
      }
    } finally {
      setAddingFromPreview(false);
    }
  };

  const teamArchived = team?.status === 'ARCHIVED';

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
          Build your team below. Open the candidate pool to browse, preview profiles, and drag
          people in — each member keeps an independent profile copy.
        </p>

        <DropColumn
          id={DROP_ZONE_TEAM}
          title="Team members"
          description="People assigned to this team (profile copies)"
          count={teamMembers.length}
          accent="team"
          layout={teamMembers.length > 0 ? 'grid' : 'list'}
          headerAction={
            <Button
              type="button"
              variant={poolOpen ? 'outline' : 'default'}
              className="shrink-0 gap-2"
              onClick={() => setPoolOpen((open) => !open)}
            >
              <PanelRightOpen className="h-4 w-4" />
              {poolOpen ? 'Pool open' : 'Browse candidates'}
              <Badge variant="secondary" className="ml-0.5 bg-background/80">
                {poolCandidates.length}
              </Badge>
            </Button>
          }
        >
          {teamMembers.length === 0 ? (
            <div className="col-span-full flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center text-sm text-muted-foreground">
              <Users className="h-10 w-10 opacity-30" />
              <p>No team members yet.</p>
              <Button type="button" variant="outline" onClick={() => setPoolOpen(true)}>
                <PanelRightOpen className="h-4 w-4" />
                Browse candidates
              </Button>
            </div>
          ) : (
            teamMembers.map((member) => {
              const sourceId = member.sourceCandidateId ?? member.candidateId;
              return (
                <CandidatePanel
                  key={member.id}
                  candidate={member.profile}
                  dragId={teamDragId(sourceId)}
                  isDragging={activeDragId === teamDragId(sourceId)}
                  footer={
                    <div className="mt-3 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Team copy
                        </Badge>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1 px-2 text-xs"
                          onClick={() => setEditingMember(member)}
                          disabled={busy || teamArchived}
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1 px-2 text-xs text-destructive hover:text-destructive"
                          onClick={() => removeFromTeam(sourceId)}
                          disabled={busy || teamArchived || !teamId}
                        >
                          <UserMinus className="h-3 w-3" />
                          Remove
                        </Button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-muted-foreground">Role</span>
                        <div className="w-40">
                          <RoleSelect
                            value={member.role}
                            onChange={(role) => changeRole(sourceId, role)}
                            disabled={busy || teamArchived}
                          />
                        </div>
                        {member.isLead && <Badge variant="default">Lead</Badge>}
                      </div>
                    </div>
                  }
                />
              );
            })
          )}
        </DropColumn>

        <CandidatePoolDrawer
          open={poolOpen}
          onClose={() => setPoolOpen(false)}
          count={poolCandidates.length}
        >
          <DropColumn
            id={DROP_ZONE_POOL}
            title="Available candidates"
            description="Drag onto the team to assign"
            count={poolCandidates.length}
            accent="pool"
            scrollable
            compact
            toolbar={
              <div className="mb-3 space-y-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={poolSearch}
                    onChange={(e) => setPoolSearch(e.target.value)}
                    placeholder="Search available candidates…"
                    className="pl-9 pr-9"
                    aria-label="Search available candidates"
                  />
                  {poolSearch && (
                    <button
                      type="button"
                      onClick={() => setPoolSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                      aria-label="Clear pool search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {poolSearch.trim() && (
                  <p className="text-xs text-muted-foreground">
                    Showing {filteredPoolCandidates.length} of {poolCandidates.length} available
                  </p>
                )}
              </div>
            }
          >
            {poolCandidates.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground">
                <p>All candidates are on this team</p>
              </div>
            ) : filteredPoolCandidates.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground">
                <p>No candidates match your search.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setPoolSearch('')}
                >
                  Clear search
                </Button>
              </div>
            ) : (
              filteredPoolCandidates.map((candidate) => (
                <CandidatePoolRow
                  key={candidate.id}
                  candidate={candidate}
                  dragId={poolDragId(candidate.id)}
                  isDragging={activeDragId === poolDragId(candidate.id)}
                  onPreview={() => setPreviewCandidate(candidate)}
                />
              ))
            )}
          </DropColumn>
        </CandidatePoolDrawer>

        {!poolOpen && poolCandidates.length > 0 && (
          <Button
            type="button"
            className="fixed bottom-6 right-6 z-20 gap-2 shadow-lg md:hidden"
            onClick={() => setPoolOpen(true)}
          >
            <PanelRightOpen className="h-4 w-4" />
            Candidates ({poolCandidates.length})
          </Button>
        )}
      </div>

      {previewCandidate && (
        <CandidateProfilePreview
          candidate={previewCandidate}
          open
          onClose={() => setPreviewCandidate(null)}
          onAddToTeam={handleAddFromPreview}
          addDisabled={busy || teamArchived || addingFromPreview}
          adding={addingFromPreview}
        />
      )}

      {editingMember && (
        <TeamMemberProfileForm
          member={editingMember}
          open={Boolean(editingMember)}
          onClose={() => setEditingMember(null)}
          onSave={saveMemberProfile}
          disabled={busy || team?.status === 'ARCHIVED'}
        />
      )}

      <DragOverlay dropAnimation={null}>
        {activeCandidate ? (
          <div className="w-[280px] rotate-2 opacity-95 shadow-panel-hover">
            {activeDragId && parseDragId(activeDragId).zone === 'team' ? (
              <CandidatePanel candidate={activeCandidate} dragId="overlay" />
            ) : (
              <CandidatePoolRow
                candidate={activeCandidate}
                dragId="overlay"
              />
            )}
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
