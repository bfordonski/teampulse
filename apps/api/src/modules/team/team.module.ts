import { Module } from '@nestjs/common';
import { CandidateModule } from '../candidate/candidate.module';
import { TEAM_REPOSITORY } from './domain/repositories/team.repository';
import { ActivateTeamUseCase } from './application/use-cases/activate-team.use-case';
import { AddTeamMemberUseCase } from './application/use-cases/add-team-member.use-case';
import { AssignMemberRoleUseCase } from './application/use-cases/assign-member-role.use-case';
import { CreateTeamUseCase } from './application/use-cases/create-team.use-case';
import { GetTeamUseCase } from './application/use-cases/get-team.use-case';
import { ListTeamsUseCase } from './application/use-cases/list-teams.use-case';
import { RemoveTeamMemberUseCase } from './application/use-cases/remove-team-member.use-case';
import { UpdateTeamUseCase } from './application/use-cases/update-team.use-case';
import { UpdateTeamMemberProfileUseCase } from './application/use-cases/update-team-member-profile.use-case';
import { TeamController } from './infrastructure/http/team.controller';
import { PrismaTeamRepository } from './infrastructure/persistence/prisma-team.repository';

@Module({
  imports: [CandidateModule],
  controllers: [TeamController],
  providers: [
    CreateTeamUseCase,
    ListTeamsUseCase,
    GetTeamUseCase,
    AddTeamMemberUseCase,
    RemoveTeamMemberUseCase,
    AssignMemberRoleUseCase,
    ActivateTeamUseCase,
    UpdateTeamUseCase,
    UpdateTeamMemberProfileUseCase,
    {
      provide: TEAM_REPOSITORY,
      useClass: PrismaTeamRepository,
    },
  ],
  exports: [TEAM_REPOSITORY],
})
export class TeamModule {}
