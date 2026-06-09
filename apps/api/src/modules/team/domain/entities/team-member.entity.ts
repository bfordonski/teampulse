import { Entity, Result } from '@consulting/shared-kernel';
import { ProjectRole } from '../value-objects/project-role.vo';
import { TeamMemberId } from '../value-objects/team-member-id.vo';

export interface TeamMemberProps {
  candidateId: string;
  role: ProjectRole;
  isLead: boolean;
  joinedAt: Date;
}

export class TeamMember extends Entity<TeamMemberProps> {
  private constructor(props: TeamMemberProps, id?: TeamMemberId) {
    super(props, id);
  }

  get teamMemberId(): TeamMemberId {
    return this._id as TeamMemberId;
  }

  get candidateId(): string {
    return this.props.candidateId;
  }

  get role(): ProjectRole {
    return this.props.role;
  }

  get isLead(): boolean {
    return this.props.isLead;
  }

  get joinedAt(): Date {
    return this.props.joinedAt;
  }

  static reconstitute(
    props: TeamMemberProps,
    id: TeamMemberId,
  ): TeamMember {
    return new TeamMember(props, id);
  }

  static create(props: {
    candidateId: string;
    role: string;
    isLead?: boolean;
    joinedAt?: Date;
  }, id?: TeamMemberId): Result<TeamMember> {
    const roleResult = ProjectRole.create(props.role);
    if (roleResult.isFailure) return Result.fail(roleResult.error!);

    const isLead = props.isLead ?? roleResult.value!.isLeadRole();

    return Result.ok(
      new TeamMember(
        {
          candidateId: props.candidateId,
          role: roleResult.value!,
          isLead,
          joinedAt: props.joinedAt ?? new Date(),
        },
        id ?? TeamMemberId.create(),
      ),
    );
  }

  assignRole(role: string): Result<void> {
    const roleResult = ProjectRole.create(role);
    if (roleResult.isFailure) return Result.fail(roleResult.error!);

    this.props.role = roleResult.value!;
    this.props.isLead = roleResult.value!.isLeadRole();
    return Result.ok();
  }
}
