import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TEAM_REPOSITORY, ITeamRepository } from '../../domain/repositories/team.repository';
import { TeamId } from '../../domain/value-objects/team-id.vo';
import { AssignRoleDto } from '../dtos/assign-role.dto';
import { TeamResponseDto } from '../dtos/team-response.dto';
import { TeamMapper } from '../mappers/team.mapper';

@Injectable()
export class AssignMemberRoleUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: ITeamRepository,
  ) {}

  async execute(
    teamId: string,
    candidateId: string,
    dto: AssignRoleDto,
  ): Promise<TeamResponseDto> {
    const team = await this.teamRepository.findById(TeamId.create(teamId));
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found`);
    }

    const assignResult = team.assignMemberRole(candidateId, dto.role);
    if (assignResult.isFailure) {
      throw new Error(assignResult.error);
    }

    await this.teamRepository.save(team);
    return TeamMapper.toResponse(team);
  }
}
