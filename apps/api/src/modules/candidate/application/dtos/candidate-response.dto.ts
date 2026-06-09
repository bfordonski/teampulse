export interface CandidateResponseDto {
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
  cvFilePath?: string;
  keySkills: string[];
  businessSkills: string[];
  technologySkills: string[];
  languages: Array<{ language: string; level: string }>;
  industryExperience: string[];
  certificates: string[];
  selectedClients: string[];
  skills: Array<{
    name: string;
    category: string;
    level: number;
    yearsUsed: number;
  }>;
  projects: Array<{
    type: string;
    role?: string;
    client?: string;
    description?: string;
    startYear?: number;
    endYear?: number;
  }>;
}
