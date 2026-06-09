import { Team, TeamStatus } from '../../domain/entities/team.entity';
import { TeamMember } from '../../domain/entities/team-member.entity';
import { ProjectRole } from '../../domain/value-objects/project-role.vo';
import { TeamId } from '../../domain/value-objects/team-id.vo';
import { TeamMemberId } from '../../domain/value-objects/team-member-id.vo';

type PrismaTeamRecord = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  members: Array<{
    id: string;
    candidateId: string;
    role: string;
    isLead: boolean;
    joinedAt: Date;
  }>;
};

export class TeamPrismaMapper {
  static toDomain(record: PrismaTeamRecord): Team {
    const members = record.members.map((m) => {
      const roleResult = ProjectRole.create(m.role);
      if (roleResult.isFailure) {
        throw new Error(`Invalid role on team member: ${roleResult.error}`);
      }

      return TeamMember.reconstitute(
        {
          candidateId: m.candidateId,
          role: roleResult.value!,
          isLead: m.isLead,
          joinedAt: m.joinedAt,
        },
        TeamMemberId.create(m.id),
      );
    });

    return Team.reconstitute(
      {
        name: record.name,
        description: record.description ?? undefined,
        status: record.status as TeamStatus,
        members,
      },
      TeamId.create(record.id),
    );
  }

  static toPersistence(team: Team) {
    return {
      id: team.teamId.toString(),
      name: team.name,
      description: team.description ?? null,
      status: team.status,
      members: team.members.map((m) => ({
        id: m.teamMemberId.toString(),
        candidateId: m.candidateId,
        role: m.role.value,
        isLead: m.isLead,
        joinedAt: m.joinedAt,
      })),
    };
  }
}
