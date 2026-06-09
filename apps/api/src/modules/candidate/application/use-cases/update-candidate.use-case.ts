import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CANDIDATE_REPOSITORY,
  ICandidateRepository,
} from '../../domain/repositories/candidate.repository';
import { CandidateId } from '../../domain/value-objects/candidate-id.vo';
import { UpdateCandidateDto } from '../dtos/update-candidate.dto';
import { CandidateResponseDto } from '../dtos/candidate-response.dto';
import { CandidateMapper } from '../mappers/candidate.mapper';

@Injectable()
export class UpdateCandidateUseCase {
  constructor(
    @Inject(CANDIDATE_REPOSITORY)
    private readonly candidateRepository: ICandidateRepository,
  ) {}

  async execute(id: string, dto: UpdateCandidateDto): Promise<CandidateResponseDto> {
    const candidate = await this.candidateRepository.findById(CandidateId.create(id));
    if (!candidate) {
      throw new NotFoundException(`Candidate ${id} not found`);
    }

    const updateResult = candidate.updateProfile(dto);
    if (updateResult.isFailure) {
      throw new Error(updateResult.error);
    }

    await this.candidateRepository.save(candidate);
    return CandidateMapper.toResponse(candidate);
  }
}
