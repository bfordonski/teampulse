import { Team } from '../../domain/entities/team.entity';
import { TeamResponseDto } from '../dtos/team-response.dto';

export class TeamMapper {
  static toResponse(team: Team): TeamResponseDto {
    return {
      id: team.teamId.toString(),
      name: team.name,
      description: team.description,
      status: team.status,
      members: team.members.map((m) => ({
        id: m.teamMemberId.toString(),
        candidateId: m.candidateId,
        role: m.role.value,
        isLead: m.isLead,
        joinedAt: m.joinedAt.toISOString(),
      })),
    };
  }
}
