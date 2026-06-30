import { Entity, Result } from '@consulting/shared-kernel';
import { Candidate } from '../../../candidate/domain/entities/candidate.entity';
import {
  MemberProfileSnapshot,
  UpdateMemberProfileProps,
} from '../value-objects/member-profile-snapshot.vo';
import { ProjectRole } from '../value-objects/project-role.vo';
import { TeamMemberId } from '../value-objects/team-member-id.vo';

export interface TeamMemberProps {
  sourceCandidateId: string;
  profile: MemberProfileSnapshot;
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

  get sourceCandidateId(): string {
    return this.props.sourceCandidateId;
  }

  /** @deprecated Use sourceCandidateId — kept for URL compatibility in team operations */
  get candidateId(): string {
    return this.props.sourceCandidateId;
  }

  get profile(): MemberProfileSnapshot {
    return this.props.profile;
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

  static createFromCandidate(
    props: {
      candidate: Candidate;
      role: string;
      joinedAt?: Date;
    },
    id?: TeamMemberId,
  ): Result<TeamMember> {
    const roleResult = ProjectRole.create(props.role);
    if (roleResult.isFailure) return Result.fail(roleResult.error!);

    const profileResult = MemberProfileSnapshot.fromCandidate(props.candidate);
    if (profileResult.isFailure) return Result.fail(profileResult.error!);

    const isLead = roleResult.value!.isLeadRole();

    return Result.ok(
      new TeamMember(
        {
          sourceCandidateId: props.candidate.candidateId.toString(),
          profile: profileResult.value!,
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

  updateProfile(updates: UpdateMemberProfileProps): Result<void> {
    const updatedResult = this.props.profile.update(updates);
    if (updatedResult.isFailure) return Result.fail(updatedResult.error!);

    this.props.profile = updatedResult.value!;
    return Result.ok();
  }
}
