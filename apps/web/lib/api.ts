import type { Candidate, Team } from './types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  getCandidates: () => request<Candidate[]>('/candidates'),
  getTeams: () => request<Team[]>('/teams'),
  getTeam: (id: string) => request<Team>(`/teams/${id}`),
  createTeam: (data: { name: string; description?: string }) =>
    request<Team>('/teams', { method: 'POST', body: JSON.stringify(data) }),
  updateTeam: (id: string, data: { name?: string; description?: string }) =>
    request<Team>(`/teams/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  addMember: (teamId: string, candidateId: string, role: string) =>
    request<Team>(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ candidateId, role }),
    }),
  removeMember: (teamId: string, candidateId: string) =>
    request<Team>(`/teams/${teamId}/members/${candidateId}`, { method: 'DELETE' }),
  assignRole: (teamId: string, candidateId: string, role: string) =>
    request<Team>(`/teams/${teamId}/members/${candidateId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  activateTeam: (teamId: string) =>
    request<Team>(`/teams/${teamId}/activate`, { method: 'POST' }),
};

export const PROJECT_ROLES = [
  'Tech Lead',
  'Developer',
  'Architect',
  'Business Analyst',
  'Project Manager',
  'QA Engineer',
  'DevOps Engineer',
] as const;
