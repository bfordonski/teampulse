import { Candidate } from '../../domain/entities/candidate.entity';

import {

  Availability,

  AvailabilityStatus,

} from '../../domain/value-objects/availability.vo';

import { CandidateId } from '../../domain/value-objects/candidate-id.vo';

import { Email } from '../../domain/value-objects/email.vo';

import { Language } from '../../domain/value-objects/language.vo';

import { ProjectHistory } from '../../domain/value-objects/project-history.vo';

import { SkillCategory } from '../../domain/value-objects/skill-category.vo';

import { Skill } from '../../domain/value-objects/skill.vo';



type PrismaCandidateRecord = {

  id: string;

  firstName: string;

  lastName: string;

  email: string;

  title: string;

  yearsExperience: number;

  availability: string;

  education: string | null;

  summary: string | null;

  cvFilePath: string | null;

  profilePhotoUrl: string | null;

  skills: Array<{

    name: string;

    category: string;

    level: number;

    yearsUsed: number;

  }>;

  projects: Array<{
    name: string;
    description: string;
    technologies: string | null;
  }>;

  languages: Array<{ language: string; level: string }>;

  industries: Array<{ name: string }>;

  certificates: Array<{ name: string }>;

  selectedClients: Array<{ name: string }>;

};



export class CandidatePrismaMapper {

  static toDomain(record: PrismaCandidateRecord): Candidate {

    const emailResult = Email.create(record.email);

    if (emailResult.isFailure) {

      throw new Error(`Failed to hydrate candidate email: ${emailResult.error}`);

    }



    const availabilityResult = Availability.create(

      record.availability as AvailabilityStatus,

    );

    if (availabilityResult.isFailure) {

      throw new Error(`Failed to hydrate availability: ${availabilityResult.error}`);

    }



    const skills = record.skills.map((s) => {

      const skillResult = Skill.create({

        name: s.name,

        category: s.category as SkillCategory,

        level: s.level,

        yearsUsed: s.yearsUsed,

      });

      if (skillResult.isFailure) {

        throw new Error(`Failed to hydrate skill: ${skillResult.error}`);

      }

      return skillResult.value!;

    });



    const projects = record.projects.map((p) => {

      const projectResult = ProjectHistory.create({
        name: p.name,
        description: p.description,
        technologies: p.technologies ?? undefined,
      });

      if (projectResult.isFailure) {

        throw new Error(`Failed to hydrate project: ${projectResult.error}`);

      }

      return projectResult.value!;

    });



    const languages = record.languages.map((l) => {

      const languageResult = Language.create(l);

      if (languageResult.isFailure) {

        throw new Error(`Failed to hydrate language: ${languageResult.error}`);

      }

      return languageResult.value!;

    });



    return Candidate.reconstitute(

      {

        firstName: record.firstName,

        lastName: record.lastName,

        email: emailResult.value!,

        title: record.title,

        yearsExperience: record.yearsExperience,

        availability: availabilityResult.value!,

        education: record.education ?? undefined,

        summary: record.summary ?? undefined,

        cvFilePath: record.cvFilePath ?? undefined,

        profilePhotoUrl: record.profilePhotoUrl ?? undefined,

        skills,

        projects,

        languages,

        industryExperience: record.industries.map((i) => i.name),

        certificates: record.certificates.map((c) => c.name),

        selectedClients: record.selectedClients.map((c) => c.name),

      },

      CandidateId.create(record.id),

    );

  }



  static toPersistence(candidate: Candidate) {

    return {

      id: candidate.candidateId.toString(),

      firstName: candidate.firstName,

      lastName: candidate.lastName,

      email: candidate.email.value,

      title: candidate.title,

      yearsExperience: candidate.yearsExperience,

      availability: candidate.availability.status,

      education: candidate.education ?? null,

      summary: candidate.summary ?? null,

      cvFilePath: candidate.cvFilePath ?? null,

      profilePhotoUrl: candidate.profilePhotoUrl ?? null,

      skills: candidate.skills.map((s) => ({

        name: s.name,

        category: s.category,

        level: s.level,

        yearsUsed: s.yearsUsed,

      })),

      projects: candidate.projects.map((p) => ({
        name: p.name,
        description: p.description,
        technologies: p.technologies ?? null,
      })),

      languages: candidate.languages.map((l) => ({

        language: l.language,

        level: l.level,

      })),

      industries: candidate.industryExperience.map((name) => ({ name })),

      certificates: candidate.certificates.map((name) => ({ name })),

      selectedClients: candidate.selectedClients.map((name) => ({ name })),

    };

  }

}


