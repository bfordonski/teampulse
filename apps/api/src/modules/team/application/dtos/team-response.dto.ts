import { CandidateResponseDto } from '../../../candidate/application/dtos/candidate-response.dto';

export interface TeamMemberResponseDto {
  id: string;
  sourceCandidateId: string;
  /** @deprecated Use sourceCandidateId */
  candidateId: string;
  role: string;
  isLead: boolean;
  joinedAt: string;
  profile: CandidateResponseDto;
}

export interface TeamResponseDto {
  id: string;
  name: string;
  description?: string;
  status: string;
  members: TeamMemberResponseDto[];
}
