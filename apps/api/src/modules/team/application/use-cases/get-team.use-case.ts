import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TEAM_REPOSITORY, ITeamRepository } from '../../domain/repositories/team.repository';
import { TeamId } from '../../domain/value-objects/team-id.vo';
import { TeamResponseDto } from '../dtos/team-response.dto';
import { TeamMapper } from '../mappers/team.mapper';

@Injectable()
export class GetTeamUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: ITeamRepository,
  ) {}

  async execute(teamId: string): Promise<TeamResponseDto> {
    const team = await this.teamRepository.findById(TeamId.create(teamId));
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found`);
    }
    return TeamMapper.toResponse(team);
  }
}
