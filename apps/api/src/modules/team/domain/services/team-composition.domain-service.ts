import { Result } from '@consulting/shared-kernel';
import { StandardProjectRole } from '../value-objects/project-role.vo';
import { TeamMember } from '../entities/team-member.entity';

export interface TeamCompositionRules {
  minMembers?: number;
  maxMembers?: number;
  requireTechLead?: boolean;
  maxLeads?: number;
}

/** Rules while building a draft team (add/remove members, change roles). */
export const DRAFT_COMPOSITION_RULES: TeamCompositionRules = {
  maxMembers: 12,
  maxLeads: 2,
  requireTechLead: false,
};

/** Rules enforced when activating a team. */
export const ACTIVATION_COMPOSITION_RULES: TeamCompositionRules = {
  minMembers: 1,
  maxMembers: 12,
  requireTechLead: true,
  maxLeads: 2,
};

/**
 * Domain service enforcing team composition invariants
 * across TeamMember entities.
 */
export class TeamCompositionDomainService {
  validateComposition(
    members: TeamMember[],
    rules: TeamCompositionRules = DRAFT_COMPOSITION_RULES,
  ): Result<void> {
    const count = members.length;

    if (rules.minMembers !== undefined && count < rules.minMembers) {
      return Result.fail(`Team must have at least ${rules.minMembers} member(s)`);
    }

    if (rules.maxMembers !== undefined && count > rules.maxMembers) {
      return Result.fail(`Team cannot exceed ${rules.maxMembers} members`);
    }

    const leadCount = members.filter((m) => m.isLead).length;
    if (rules.maxLeads !== undefined && leadCount > rules.maxLeads) {
      return Result.fail(`Team cannot have more than ${rules.maxLeads} lead role(s)`);
    }

    if (rules.requireTechLead) {
      const hasTechLead = members.some(
        (m) => m.role.value === StandardProjectRole.TECH_LEAD,
      );
      if (!hasTechLead && count > 0) {
        return Result.fail('Team must include a Tech Lead before activation');
      }
    }

    const candidateIds = members.map((m) => m.candidateId);
    const uniqueIds = new Set(candidateIds);
    if (uniqueIds.size !== candidateIds.length) {
      return Result.fail('Duplicate candidates are not allowed on a team');
    }

    return Result.ok();
  }
}
