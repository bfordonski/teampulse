import {
  Availability,
  AvailabilityStatus,
} from '../../../candidate/domain/value-objects/availability.vo';
import { Email } from '../../../candidate/domain/value-objects/email.vo';
import { Language } from '../../../candidate/domain/value-objects/language.vo';
import { ProjectHistory } from '../../../candidate/domain/value-objects/project-history.vo';
import { SkillCategory } from '../../../candidate/domain/value-objects/skill-category.vo';
import { Skill } from '../../../candidate/domain/value-objects/skill.vo';
import { Team, TeamStatus } from '../../domain/entities/team.entity';
import { TeamMember } from '../../domain/entities/team-member.entity';
import { MemberProfileSnapshot } from '../../domain/value-objects/member-profile-snapshot.vo';
import { ProjectRole } from '../../domain/value-objects/project-role.vo';
import { TeamId } from '../../domain/value-objects/team-id.vo';
import { TeamMemberId } from '../../domain/value-objects/team-member-id.vo';

type PrismaTeamMemberRecord = {
  id: string;
  sourceCandidateId: string;
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
  role: string;
  isLead: boolean;
  joinedAt: Date;
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

type PrismaTeamRecord = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  members: PrismaTeamMemberRecord[];
};

function hydrateProfile(record: PrismaTeamMemberRecord): MemberProfileSnapshot {
  const emailResult = Email.create(record.email);
  if (emailResult.isFailure) {
    throw new Error(`Failed to hydrate team member email: ${emailResult.error}`);
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

  return MemberProfileSnapshot.reconstitute({
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
  });
}

export class TeamPrismaMapper {
  static toDomain(record: PrismaTeamRecord): Team {
    const members = record.members.map((m) => {
      const roleResult = ProjectRole.create(m.role);
      if (roleResult.isFailure) {
        throw new Error(`Invalid role on team member: ${roleResult.error}`);
      }

      return TeamMember.reconstitute(
        {
          sourceCandidateId: m.sourceCandidateId,
          profile: hydrateProfile(m),
          role: roleResult.value!,
          isLead: m.isLead,
          joinedAt: m.joinedAt,
        },
        TeamMemberId.create(m.id),
      );
    });

    return Team.reconstitute(
      {
        name: record.name,
        description: record.description ?? undefined,
        status: record.status as TeamStatus,
        members,
      },
      TeamId.create(record.id),
    );
  }

  static toPersistence(team: Team) {
    return {
      id: team.teamId.toString(),
      name: team.name,
      description: team.description ?? null,
      status: team.status,
      members: team.members.map((m) => {
        const profile = m.profile;
        return {
          id: m.teamMemberId.toString(),
          sourceCandidateId: m.sourceCandidateId,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email.value,
          title: profile.title,
          yearsExperience: profile.yearsExperience,
          availability: profile.availability.status,
          education: profile.education ?? null,
          summary: profile.summary ?? null,
          cvFilePath: profile.cvFilePath ?? null,
          profilePhotoUrl: profile.profilePhotoUrl ?? null,
          role: m.role.value,
          isLead: m.isLead,
          joinedAt: m.joinedAt,
          skills: profile.skills.map((s) => ({
            name: s.name,
            category: s.category,
            level: s.level,
            yearsUsed: s.yearsUsed,
          })),
          projects: profile.projects.map((p) => ({
            name: p.name,
            description: p.description,
            technologies: p.technologies ?? null,
          })),
          languages: profile.languages.map((l) => ({
            language: l.language,
            level: l.level,
          })),
          industries: profile.industryExperience.map((name) => ({ name })),
          certificates: profile.certificates.map((name) => ({ name })),
          selectedClients: profile.selectedClients.map((name) => ({ name })),
        };
      }),
    };
  }
}
