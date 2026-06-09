import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateCandidateDto } from '../../application/dtos/create-candidate.dto';
import { UpdateCandidateDto } from '../../application/dtos/update-candidate.dto';
import { CreateCandidateUseCase } from '../../application/use-cases/create-candidate.use-case';
import { GetCandidateUseCase } from '../../application/use-cases/get-candidate.use-case';
import { ListCandidatesUseCase } from '../../application/use-cases/list-candidates.use-case';
import { UpdateCandidateUseCase } from '../../application/use-cases/update-candidate.use-case';

@Controller('candidates')
export class CandidateController {
  constructor(
    private readonly createCandidate: CreateCandidateUseCase,
    private readonly updateCandidate: UpdateCandidateUseCase,
    private readonly listCandidates: ListCandidatesUseCase,
    private readonly getCandidate: GetCandidateUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateCandidateDto) {
    return this.createCandidate.execute(dto);
  }

  @Get()
  list(
    @Query('skills') skills?: string,
    @Query('minSkillLevel') minSkillLevel?: string,
    @Query('minYearsExperience') minYearsExperience?: string,
    @Query('availability') availability?: string,
    @Query('search') search?: string,
  ) {
    return this.listCandidates.execute({
      skills: skills ? skills.split(',').map((s) => s.trim()) : undefined,
      minSkillLevel: minSkillLevel ? Number(minSkillLevel) : undefined,
      minYearsExperience: minYearsExperience
        ? Number(minYearsExperience)
        : undefined,
      availability,
      search,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.getCandidate.execute(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCandidateDto) {
    return this.updateCandidate.execute(id, dto);
  }
}
