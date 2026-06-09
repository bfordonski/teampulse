import { Inject, Injectable } from '@nestjs/common';
import { TEAM_REPOSITORY, ITeamRepository } from '../../domain/repositories/team.repository';
import { TeamResponseDto } from '../dtos/team-response.dto';
import { TeamMapper } from '../mappers/team.mapper';

@Injectable()
export class ListTeamsUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: ITeamRepository,
  ) {}

  async execute(): Promise<TeamResponseDto[]> {
    const teams = await this.teamRepository.findAll();
    return teams.map(TeamMapper.toResponse);
  }
}
