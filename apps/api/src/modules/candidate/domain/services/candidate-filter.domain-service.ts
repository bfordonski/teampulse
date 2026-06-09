import { Candidate } from '../entities/candidate.entity';
import { CandidateFilter } from '../repositories/candidate.repository';

/**
 * Domain service encapsulating cross-aggregate filtering rules
 * that do not belong on a single Candidate instance.
 */
export class CandidateFilterDomainService {
  filter(candidates: Candidate[], criteria: CandidateFilter): Candidate[] {
    return candidates.filter((candidate) => this.matches(candidate, criteria));
  }

  private matches(candidate: Candidate, criteria: CandidateFilter): boolean {
    if (criteria.minYearsExperience !== undefined) {
      if (!candidate.meetsMinimumExperience(criteria.minYearsExperience)) {
        return false;
      }
    }

    if (criteria.skills?.length) {
      if (!candidate.hasSkills(criteria.skills, criteria.minSkillLevel ?? 1)) {
        return false;
      }
    }

    if (criteria.availability) {
      if (candidate.availability.status !== criteria.availability) {
        return false;
      }
    }

    if (criteria.search) {
      const term = criteria.search.toLowerCase();
      const haystack = [
        candidate.fullName,
        candidate.title,
        candidate.email.value,
        candidate.education ?? '',
        ...candidate.skills.map((s) => s.name),
        ...candidate.industryExperience,
        ...candidate.certificates,
        ...candidate.selectedClients,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(term)) return false;
    }

    return true;
  }
}
