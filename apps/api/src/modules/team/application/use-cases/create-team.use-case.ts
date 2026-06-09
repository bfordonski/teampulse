import { Inject, Injectable } from '@nestjs/common';
import { Team } from '../../domain/entities/team.entity';
import { TEAM_REPOSITORY, ITeamRepository } from '../../domain/repositories/team.repository';
import { CreateTeamDto } from '../dtos/create-team.dto';
import { TeamResponseDto } from '../dtos/team-response.dto';
import { TeamMapper } from '../mappers/team.mapper';

@Injectable()
export class CreateTeamUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: ITeamRepository,
  ) {}

  async execute(dto: CreateTeamDto): Promise<TeamResponseDto> {
    const teamResult = Team.create(dto);
    if (teamResult.isFailure) {
      throw new Error(teamResult.error);
    }

    const team = teamResult.value!;
    await this.teamRepository.save(team);
    return TeamMapper.toResponse(team);
  }
}
