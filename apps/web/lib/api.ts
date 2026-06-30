import type {
  Candidate,
  CreateCandidateInput,
  Team,
  UpdateCandidateInput,
  UpdateTeamMemberProfileInput,
} from './types';

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

export interface GetCandidatesParams {
  search?: string;
  availability?: string;
  skills?: string;
  minYearsExperience?: number;
}

function buildQuery(params?: GetCandidatesParams): string {
  if (!params) return '';
  const sp = new URLSearchParams();
  if (params.search?.trim()) sp.set('search', params.search.trim());
  if (params.availability) sp.set('availability', params.availability);
  if (params.skills?.trim()) sp.set('skills', params.skills.trim());
  if (params.minYearsExperience !== undefined) {
    sp.set('minYearsExperience', String(params.minYearsExperience));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export const api = {
  getCandidates: (params?: GetCandidatesParams) =>
    request<Candidate[]>(`/candidates${buildQuery(params)}`),
  createCandidate: (data: CreateCandidateInput) =>
    request<Candidate>('/candidates', { method: 'POST', body: JSON.stringify(data) }),
  updateCandidate: (id: string, data: UpdateCandidateInput) =>
    request<Candidate>(`/candidates/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
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
  updateMemberProfile: (
    teamId: string,
    memberId: string,
    data: UpdateTeamMemberProfileInput,
  ) =>
    request<Team>(`/teams/${teamId}/members/${memberId}/profile`, {
      method: 'PATCH',
      body: JSON.stringify(data),
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
