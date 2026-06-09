import { Module } from '@nestjs/common';
import { CANDIDATE_REPOSITORY } from './domain/repositories/candidate.repository';
import { CreateCandidateUseCase } from './application/use-cases/create-candidate.use-case';
import { UpdateCandidateUseCase } from './application/use-cases/update-candidate.use-case';
import { ListCandidatesUseCase } from './application/use-cases/list-candidates.use-case';
import { GetCandidateUseCase } from './application/use-cases/get-candidate.use-case';
import { CandidateController } from './infrastructure/http/candidate.controller';
import { PrismaCandidateRepository } from './infrastructure/persistence/prisma-candidate.repository';

@Module({
  controllers: [CandidateController],
  providers: [
    CreateCandidateUseCase,
    UpdateCandidateUseCase,
    ListCandidatesUseCase,
    GetCandidateUseCase,
    {
      provide: CANDIDATE_REPOSITORY,
      useClass: PrismaCandidateRepository,
    },
  ],
  exports: [CANDIDATE_REPOSITORY],
})
export class CandidateModule {}
