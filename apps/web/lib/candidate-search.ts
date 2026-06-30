import type { Candidate } from './types';

export function buildCandidateSearchHaystack(candidate: Candidate): string {
  return [
    candidate.fullName,
    candidate.firstName,
    candidate.lastName,
    candidate.title,
    candidate.email,
    candidate.education ?? '',
    ...candidate.technologySkills,
    ...candidate.keySkills,
    ...candidate.businessSkills,
    ...candidate.industryExperience,
    ...candidate.certificates,
    ...candidate.selectedClients,
  ]
    .join(' ')
    .toLowerCase();
}

export function candidateMatchesSearch(
  candidate: Candidate,
  search: string,
): boolean {
  const tokens = search
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return true;

  const haystack = buildCandidateSearchHaystack(candidate);
  return tokens.every((token) => haystack.includes(token));
}
