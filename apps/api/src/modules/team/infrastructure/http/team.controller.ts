import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AddTeamMemberDto } from '../../application/dtos/add-team-member.dto';
import { AssignRoleDto } from '../../application/dtos/assign-role.dto';
import { CreateTeamDto } from '../../application/dtos/create-team.dto';
import { UpdateTeamDto } from '../../application/dtos/update-team.dto';
import { UpdateTeamUseCase } from '../../application/use-cases/update-team.use-case';
import { ActivateTeamUseCase } from '../../application/use-cases/activate-team.use-case';
import { AddTeamMemberUseCase } from '../../application/use-cases/add-team-member.use-case';
import { AssignMemberRoleUseCase } from '../../application/use-cases/assign-member-role.use-case';
import { CreateTeamUseCase } from '../../application/use-cases/create-team.use-case';
import { GetTeamUseCase } from '../../application/use-cases/get-team.use-case';
import { ListTeamsUseCase } from '../../application/use-cases/list-teams.use-case';
import { RemoveTeamMemberUseCase } from '../../application/use-cases/remove-team-member.use-case';

@Controller('teams')
export class TeamController {
  constructor(
    private readonly createTeamUseCase: CreateTeamUseCase,
    private readonly listTeamsUseCase: ListTeamsUseCase,
    private readonly getTeamUseCase: GetTeamUseCase,
    private readonly addTeamMemberUseCase: AddTeamMemberUseCase,
    private readonly removeTeamMemberUseCase: RemoveTeamMemberUseCase,
    private readonly assignMemberRoleUseCase: AssignMemberRoleUseCase,
    private readonly activateTeamUseCase: ActivateTeamUseCase,
    private readonly updateTeamUseCase: UpdateTeamUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateTeamDto) {
    return this.createTeamUseCase.execute(dto);
  }

  @Get()
  list() {
    return this.listTeamsUseCase.execute();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.getTeamUseCase.execute(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTeamDto) {
    return this.updateTeamUseCase.execute(id, dto);
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() dto: AddTeamMemberDto) {
    return this.addTeamMemberUseCase.execute(id, dto);
  }

  @Delete(':id/members/:candidateId')
  removeMember(
    @Param('id') id: string,
    @Param('candidateId') candidateId: string,
  ) {
    return this.removeTeamMemberUseCase.execute(id, candidateId);
  }

  @Patch(':id/members/:candidateId/role')
  assignRole(
    @Param('id') id: string,
    @Param('candidateId') candidateId: string,
    @Body() dto: AssignRoleDto,
  ) {
    return this.assignMemberRoleUseCase.execute(id, candidateId, dto);
  }

  @Post(':id/activate')
  activate(@Param('id') id: string) {
    return this.activateTeamUseCase.execute(id);
  }
}
