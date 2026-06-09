import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CANDIDATE_REPOSITORY,
  ICandidateRepository,
} from '../../../candidate/domain/repositories/candidate.repository';
import { CandidateId } from '../../../candidate/domain/value-objects/candidate-id.vo';
import { TEAM_REPOSITORY, ITeamRepository } from '../../domain/repositories/team.repository';
import { TeamId } from '../../domain/value-objects/team-id.vo';
import { AddTeamMemberDto } from '../dtos/add-team-member.dto';
import { TeamResponseDto } from '../dtos/team-response.dto';
import { TeamMapper } from '../mappers/team.mapper';

@Injectable()
export class AddTeamMemberUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: ITeamRepository,
    @Inject(CANDIDATE_REPOSITORY)
    private readonly candidateRepository: ICandidateRepository,
  ) {}

  async execute(teamId: string, dto: AddTeamMemberDto): Promise<TeamResponseDto> {
    const team = await this.teamRepository.findById(TeamId.create(teamId));
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found`);
    }

    const candidate = await this.candidateRepository.findById(
      CandidateId.create(dto.candidateId),
    );
    if (!candidate) {
      throw new NotFoundException(`Candidate ${dto.candidateId} not found`);
    }

    if (!candidate.availability.isAvailableForAssignment()) {
      throw new BadRequestException(
        `Candidate ${dto.candidateId} is not available for assignment`,
      );
    }

    const addResult = team.addMember(dto.candidateId, dto.role);
    if (addResult.isFailure) {
      throw new BadRequestException(addResult.error);
    }

    await this.teamRepository.save(team);
    return TeamMapper.toResponse(team);
  }
}
