import { Inject, Injectable } from '@nestjs/common';
import {
  CANDIDATE_REPOSITORY,
  CandidateFilter,
  ICandidateRepository,
} from '../../domain/repositories/candidate.repository';
import { CandidateResponseDto } from '../dtos/candidate-response.dto';
import { CandidateMapper } from '../mappers/candidate.mapper';

@Injectable()
export class ListCandidatesUseCase {
  constructor(
    @Inject(CANDIDATE_REPOSITORY)
    private readonly candidateRepository: ICandidateRepository,
  ) {}

  async execute(filter?: CandidateFilter): Promise<CandidateResponseDto[]> {
    const candidates = await this.candidateRepository.findAll(filter);
    return candidates.map(CandidateMapper.toResponse);
  }
}
