import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TEAM_REPOSITORY, ITeamRepository } from '../../domain/repositories/team.repository';
import { TeamId } from '../../domain/value-objects/team-id.vo';
import { TeamMemberId } from '../../domain/value-objects/team-member-id.vo';
import { UpdateTeamMemberProfileDto } from '../dtos/update-team-member-profile.dto';
import { TeamResponseDto } from '../dtos/team-response.dto';
import { TeamMapper } from '../mappers/team.mapper';

@Injectable()
export class UpdateTeamMemberProfileUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: ITeamRepository,
  ) {}

  async execute(
    teamId: string,
    memberId: string,
    dto: UpdateTeamMemberProfileDto,
  ): Promise<TeamResponseDto> {
    const team = await this.teamRepository.findById(TeamId.create(teamId));
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found`);
    }

    const updateResult = team.updateMemberProfile(
      TeamMemberId.create(memberId),
      dto,
    );
    if (updateResult.isFailure) {
      throw new BadRequestException(updateResult.error);
    }

    await this.teamRepository.save(team);
    return TeamMapper.toResponse(team);
  }
}
