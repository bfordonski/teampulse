import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TEAM_REPOSITORY, ITeamRepository } from '../../domain/repositories/team.repository';
import { TeamId } from '../../domain/value-objects/team-id.vo';
import { UpdateTeamDto } from '../dtos/update-team.dto';
import { TeamResponseDto } from '../dtos/team-response.dto';
import { TeamMapper } from '../mappers/team.mapper';

@Injectable()
export class UpdateTeamUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: ITeamRepository,
  ) {}

  async execute(teamId: string, dto: UpdateTeamDto): Promise<TeamResponseDto> {
    const team = await this.teamRepository.findById(TeamId.create(teamId));
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found`);
    }

    const updateResult = team.updateDetails(dto);
    if (updateResult.isFailure) {
      throw new Error(updateResult.error);
    }

    await this.teamRepository.save(team);
    return TeamMapper.toResponse(team);
  }
}
