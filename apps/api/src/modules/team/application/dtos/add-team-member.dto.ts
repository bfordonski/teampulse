import { IsString, IsUUID } from 'class-validator';

export class AddTeamMemberDto {
  @IsUUID()
  candidateId!: string;

  @IsString()
  role!: string;
}
