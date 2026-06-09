export interface TeamMemberResponseDto {
  id: string;
  candidateId: string;
  role: string;
  isLead: boolean;
  joinedAt: string;
}

export interface TeamResponseDto {
  id: string;
  name: string;
  description?: string;
  status: string;
  members: TeamMemberResponseDto[];
}
