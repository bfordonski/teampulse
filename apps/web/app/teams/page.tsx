'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Loader2, Plus, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { api } from '@/lib/api';
import type { Team } from '@/lib/types';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getTeams()
      .then(setTeams)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">Compose and manage project teams</p>
        </div>
        <Button asChild>
          <Link href="/teams/new">
            <Plus className="h-4 w-4" />
            New team
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : teams.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">No teams yet. Create your first team.</p>
            <Button asChild>
              <Link href="/teams/new">Create team</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`}>
              <Card className="h-full transition-shadow hover:shadow-panel-hover">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold">{team.name}</h2>
                    <Badge
                      variant={team.status === 'ACTIVE' ? 'success' : 'secondary'}
                    >
                      {team.status}
                    </Badge>
                  </div>
                  {team.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {team.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
