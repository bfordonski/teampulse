export interface CandidateLanguage {
  language: string;
  level: string;
}

export interface CandidateProject {
  name: string;
  description: string;
  technologies?: string;
}

export interface CandidateSkill {
  name: string;
  category: string;
  level: number;
  yearsUsed: number;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  title: string;
  position: string;
  yearsExperience: number;
  availability: string;
  education?: string;
  summary?: string;
  profilePhotoUrl?: string;
  keySkills: string[];
  businessSkills: string[];
  technologySkills: string[];
  languages: CandidateLanguage[];
  industryExperience: string[];
  certificates: string[];
  selectedClients: string[];
  skills: CandidateSkill[];
  projects?: CandidateProject[];
}

export interface TeamMember {
  id: string;
  sourceCandidateId: string;
  /** @deprecated Use sourceCandidateId */
  candidateId: string;
  role: string;
  isLead: boolean;
  joinedAt: string;
  profile: Candidate;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  status: string;
  members: TeamMember[];
}

export interface UpdateTeamMemberProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  title?: string;
  yearsExperience?: number;
  availability?: string;
  education?: string;
  summary?: string;
  profilePhotoUrl?: string;
  skills?: CandidateSkill[];
  projects?: Array<{
    name: string;
    description: string;
    technologies?: string;
  }>;
  languages?: CandidateLanguage[];
  industryExperience?: string[];
  certificates?: string[];
  selectedClients?: string[];
}

export interface CreateCandidateInput {
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  yearsExperience: number;
  availability?: string;
  education?: string;
  summary?: string;
  profilePhotoUrl?: string;
  skills?: CandidateSkill[];
  languages?: CandidateLanguage[];
  industryExperience?: string[];
  certificates?: string[];
  selectedClients?: string[];
  projects?: Array<{
    name: string;
    description: string;
    technologies?: string;
  }>;
}

export type UpdateCandidateInput = CreateCandidateInput;
