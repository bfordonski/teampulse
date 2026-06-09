export interface CandidateLanguage {
  language: string;
  level: string;
}

export interface CandidateProject {
  type: string;
  role?: string;
  client?: string;
  description?: string;
  startYear?: number;
  endYear?: number;
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
  candidateId: string;
  role: string;
  isLead: boolean;
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  status: string;
  members: TeamMember[];
}
