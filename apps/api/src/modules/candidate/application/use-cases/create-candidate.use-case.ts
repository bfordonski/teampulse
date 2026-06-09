import { Inject, Injectable } from '@nestjs/common';
import { Candidate } from '../../domain/entities/candidate.entity';
import {
  CANDIDATE_REPOSITORY,
  ICandidateRepository,
} from '../../domain/repositories/candidate.repository';
import { CreateCandidateDto } from '../dtos/create-candidate.dto';
import { CandidateResponseDto } from '../dtos/candidate-response.dto';
import { CandidateMapper } from '../mappers/candidate.mapper';

@Injectable()
export class CreateCandidateUseCase {
  constructor(
    @Inject(CANDIDATE_REPOSITORY)
    private readonly candidateRepository: ICandidateRepository,
  ) {}

  async execute(dto: CreateCandidateDto): Promise<CandidateResponseDto> {
    const emailExists = await this.candidateRepository.existsByEmail(dto.email);
    if (emailExists) {
      throw new Error(`Candidate with email ${dto.email} already exists`);
    }

    const candidateResult = Candidate.create(dto);
    if (candidateResult.isFailure) {
      throw new Error(candidateResult.error);
    }

    const candidate = candidateResult.value!;
    await this.candidateRepository.save(candidate);

    return CandidateMapper.toResponse(candidate);
  }
}
