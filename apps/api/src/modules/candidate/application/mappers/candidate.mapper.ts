import { Candidate } from '../../domain/entities/candidate.entity';
import { CandidateResponseDto } from '../dtos/candidate-response.dto';

export class CandidateMapper {
  static toResponse(candidate: Candidate): CandidateResponseDto {
    return {
      id: candidate.candidateId.toString(),
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      fullName: candidate.fullName,
      email: candidate.email.value,
      title: candidate.title,
      position: candidate.title,
      yearsExperience: candidate.yearsExperience,
      availability: candidate.availability.status,
      education: candidate.education,
      summary: candidate.summary,
      cvFilePath: candidate.cvFilePath,
      keySkills: candidate.keySkills,
      businessSkills: candidate.businessSkills,
      technologySkills: candidate.technologySkills,
      languages: candidate.languages.map((l) => ({
        language: l.language,
        level: l.level,
      })),
      industryExperience: candidate.industryExperience,
      certificates: candidate.certificates,
      selectedClients: candidate.selectedClients,
      skills: candidate.skills.map((s) => ({
        name: s.name,
        category: s.category,
        level: s.level,
        yearsUsed: s.yearsUsed,
      })),
      projects: candidate.projects.map((p) => ({
        type: p.name,
        role: p.role,
        client: p.client,
        description: p.description,
        startYear: p.startYear,
        endYear: p.endYear,
      })),
    };
  }
}
