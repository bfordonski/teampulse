import { AggregateRoot, Guard, Result } from '@consulting/shared-kernel';
import { TeamMemberAddedEvent } from '../events/team-member-added.event';
import {
  ACTIVATION_COMPOSITION_RULES,
  DRAFT_COMPOSITION_RULES,
  TeamCompositionDomainService,
} from '../services/team-composition.domain-service';
import { TeamId } from '../value-objects/team-id.vo';
import { TeamMember } from './team-member.entity';

export enum TeamStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export interface TeamProps {
  name: string;
  description?: string;
  status: TeamStatus;
  members: TeamMember[];
}

export class Team extends AggregateRoot<TeamProps> {
  private static readonly compositionService = new TeamCompositionDomainService();

  private constructor(props: TeamProps, id?: TeamId) {
    super(props, id);
  }

  get teamId(): TeamId {
    return this._id as TeamId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get status(): TeamStatus {
    return this.props.status;
  }

  get members(): TeamMember[] {
    return [...this.props.members];
  }

  static create(props: { name: string; description?: string }, id?: TeamId): Result<Team> {
    const guard = Guard.againstEmpty(props.name, 'team name');
    if (guard.isFailure) return Result.fail(guard.error!);

    return Result.ok(
      new Team(
        {
          name: props.name.trim(),
          description: props.description?.trim(),
          status: TeamStatus.DRAFT,
          members: [],
        },
        id ?? TeamId.create(),
      ),
    );
  }

  /** Rebuild aggregate from persistence without emitting domain events. */
  static reconstitute(
    props: TeamProps,
    id: TeamId,
  ): Team {
    const team = new Team(props, id);
    team.clearDomainEvents();
    return team;
  }

  updateDetails(updates: { name?: string; description?: string }): Result<void> {
    if (this.props.status === TeamStatus.ARCHIVED) {
      return Result.fail('Cannot modify an archived team');
    }

    if (updates.name !== undefined) {
      const guard = Guard.againstEmpty(updates.name, 'team name');
      if (guard.isFailure) return Result.fail(guard.error!);
      this.props.name = updates.name.trim();
    }

    if (updates.description !== undefined) {
      this.props.description = updates.description.trim() || undefined;
    }

    return Result.ok();
  }

  addMember(candidateId: string, role: string): Result<void> {
    if (this.props.status === TeamStatus.ARCHIVED) {
      return Result.fail('Cannot modify an archived team');
    }

    if (this.hasMember(candidateId)) {
      return Result.fail('Candidate is already on this team');
    }

    const memberResult = TeamMember.create({ candidateId, role });
    if (memberResult.isFailure) return Result.fail(memberResult.error!);

    const tentativeMembers = [...this.props.members, memberResult.value!];
    const validation = Team.compositionService.validateComposition(
      tentativeMembers,
      DRAFT_COMPOSITION_RULES,
    );
    if (validation.isFailure) return Result.fail(validation.error!);

    this.props.members.push(memberResult.value!);
    this.addDomainEvent(
      new TeamMemberAddedEvent(
        this.teamId.toString(),
        candidateId,
        role,
      ),
    );

    return Result.ok();
  }

  removeMember(candidateId: string): Result<void> {
    if (this.props.status === TeamStatus.ARCHIVED) {
      return Result.fail('Cannot modify an archived team');
    }

    const index = this.props.members.findIndex((m) => m.candidateId === candidateId);
    if (index === -1) {
      return Result.fail('Candidate is not a member of this team');
    }

    this.props.members.splice(index, 1);
    return Result.ok();
  }

  assignMemberRole(candidateId: string, role: string): Result<void> {
    const member = this.props.members.find((m) => m.candidateId === candidateId);
    if (!member) {
      return Result.fail('Candidate is not a member of this team');
    }

    const assignResult = member.assignRole(role);
    if (assignResult.isFailure) return Result.fail(assignResult.error!);

    const validation = Team.compositionService.validateComposition(
      this.props.members,
      DRAFT_COMPOSITION_RULES,
    );
    if (validation.isFailure) return Result.fail(validation.error!);

    return Result.ok();
  }

  activate(): Result<void> {
    const validation = Team.compositionService.validateComposition(
      this.props.members,
      ACTIVATION_COMPOSITION_RULES,
    );
    if (validation.isFailure) return Result.fail(validation.error!);

    this.props.status = TeamStatus.ACTIVE;
    return Result.ok();
  }

  archive(): void {
    this.props.status = TeamStatus.ARCHIVED;
  }

  hasMember(candidateId: string): boolean {
    return this.props.members.some((m) => m.candidateId === candidateId);
  }

  getLeadCount(): number {
    return this.props.members.filter((m) => m.isLead).length;
  }
}
