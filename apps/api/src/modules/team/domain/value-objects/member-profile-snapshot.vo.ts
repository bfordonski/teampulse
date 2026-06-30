import { Guard, Result, ValueObject } from '@consulting/shared-kernel';
import { Candidate } from '../../../candidate/domain/entities/candidate.entity';
import { Availability, AvailabilityStatus } from '../../../candidate/domain/value-objects/availability.vo';
import { Email } from '../../../candidate/domain/value-objects/email.vo';
import { Language } from '../../../candidate/domain/value-objects/language.vo';
import { ProjectHistory } from '../../../candidate/domain/value-objects/project-history.vo';
import { SkillCategory } from '../../../candidate/domain/value-objects/skill-category.vo';
import { Skill } from '../../../candidate/domain/value-objects/skill.vo';

export interface MemberProfileSnapshotProps {
  firstName: string;
  lastName: string;
  email: Email;
  title: string;
  yearsExperience: number;
  availability: Availability;
  education?: string;
  summary?: string;
  cvFilePath?: string;
  profilePhotoUrl?: string;
  skills: Skill[];
  projects: ProjectHistory[];
  languages: Language[];
  industryExperience: string[];
  certificates: string[];
  selectedClients: string[];
}

export interface UpdateMemberProfileProps {
  firstName?: string;
  lastName?: string;
  email?: string;
  title?: string;
  yearsExperience?: number;
  availability?: AvailabilityStatus;
  education?: string;
  summary?: string;
  cvFilePath?: string;
  profilePhotoUrl?: string;
  skills?: Array<{
    name: string;
    category?: SkillCategory;
    level?: number;
    yearsUsed?: number;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies?: string;
  }>;
  languages?: Array<{ language: string; level: string }>;
  industryExperience?: string[];
  certificates?: string[];
  selectedClients?: string[];
}

export class MemberProfileSnapshot extends ValueObject<MemberProfileSnapshotProps> {
  private constructor(props: MemberProfileSnapshotProps) {
    super(props);
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }

  get email(): Email {
    return this.props.email;
  }

  get title(): string {
    return this.props.title;
  }

  get yearsExperience(): number {
    return this.props.yearsExperience;
  }

  get availability(): Availability {
    return this.props.availability;
  }

  get education(): string | undefined {
    return this.props.education;
  }

  get summary(): string | undefined {
    return this.props.summary;
  }

  get cvFilePath(): string | undefined {
    return this.props.cvFilePath;
  }

  get profilePhotoUrl(): string | undefined {
    return this.props.profilePhotoUrl;
  }

  get skills(): Skill[] {
    return [...this.props.skills];
  }

  get projects(): ProjectHistory[] {
    return [...this.props.projects];
  }

  get languages(): Language[] {
    return [...this.props.languages];
  }

  get industryExperience(): string[] {
    return [...this.props.industryExperience];
  }

  get certificates(): string[] {
    return [...this.props.certificates];
  }

  get selectedClients(): string[] {
    return [...this.props.selectedClients];
  }

  get keySkills(): string[] {
    return this.skillsByCategory(SkillCategory.KEY);
  }

  get businessSkills(): string[] {
    return this.skillsByCategory(SkillCategory.BUSINESS);
  }

  get technologySkills(): string[] {
    return this.skillsByCategory(SkillCategory.TECHNOLOGY);
  }

  private skillsByCategory(category: SkillCategory): string[] {
    return this.props.skills
      .filter((s) => s.category === category)
      .map((s) => s.name);
  }

  static fromCandidate(candidate: Candidate): Result<MemberProfileSnapshot> {
    return Result.ok(
      new MemberProfileSnapshot({
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        title: candidate.title,
        yearsExperience: candidate.yearsExperience,
        availability: candidate.availability,
        education: candidate.education,
        summary: candidate.summary,
        cvFilePath: candidate.cvFilePath,
        profilePhotoUrl: candidate.profilePhotoUrl,
        skills: candidate.skills.map((s) =>
          Skill.create({
            name: s.name,
            category: s.category,
            level: s.level,
            yearsUsed: s.yearsUsed,
          }).value!,
        ),
        projects: candidate.projects.map((p) =>
          ProjectHistory.create({
            name: p.name,
            description: p.description,
            technologies: p.technologies,
          }).value!,
        ),
        languages: candidate.languages.map((l) =>
          Language.create({ language: l.language, level: l.level }).value!,
        ),
        industryExperience: [...candidate.industryExperience],
        certificates: [...candidate.certificates],
        selectedClients: [...candidate.selectedClients],
      }),
    );
  }

  static reconstitute(props: MemberProfileSnapshotProps): MemberProfileSnapshot {
    return new MemberProfileSnapshot(props);
  }

  update(updates: UpdateMemberProfileProps): Result<MemberProfileSnapshot> {
    let firstName = this.props.firstName;
    let lastName = this.props.lastName;
    let email = this.props.email;
    let title = this.props.title;
    let yearsExperience = this.props.yearsExperience;
    let availability = this.props.availability;
    let education = this.props.education;
    let summary = this.props.summary;
    let cvFilePath = this.props.cvFilePath;
    let profilePhotoUrl = this.props.profilePhotoUrl;
    let skills = this.props.skills;
    let projects = this.props.projects;
    let languages = this.props.languages;
    let industryExperience = this.props.industryExperience;
    let certificates = this.props.certificates;
    let selectedClients = this.props.selectedClients;

    if (updates.firstName !== undefined) {
      const guard = Guard.againstEmpty(updates.firstName, 'firstName');
      if (guard.isFailure) return Result.fail(guard.error!);
      firstName = updates.firstName.trim();
    }
    if (updates.lastName !== undefined) {
      const guard = Guard.againstEmpty(updates.lastName, 'lastName');
      if (guard.isFailure) return Result.fail(guard.error!);
      lastName = updates.lastName.trim();
    }
    if (updates.email !== undefined) {
      const emailResult = Email.create(updates.email);
      if (emailResult.isFailure) return Result.fail(emailResult.error!);
      email = emailResult.value!;
    }
    if (updates.title !== undefined) {
      const guard = Guard.againstEmpty(updates.title, 'title');
      if (guard.isFailure) return Result.fail(guard.error!);
      title = updates.title.trim();
    }
    if (updates.yearsExperience !== undefined) {
      if (updates.yearsExperience < 0) {
        return Result.fail('Years of experience cannot be negative');
      }
      yearsExperience = updates.yearsExperience;
    }
    if (updates.availability !== undefined) {
      const availabilityResult = Availability.create(updates.availability);
      if (availabilityResult.isFailure) return Result.fail(availabilityResult.error!);
      availability = availabilityResult.value!;
    }
    if (updates.education !== undefined) {
      education = updates.education.trim() || undefined;
    }
    if (updates.summary !== undefined) {
      summary = updates.summary.trim() || undefined;
    }
    if (updates.cvFilePath !== undefined) {
      cvFilePath = updates.cvFilePath;
    }
    if (updates.profilePhotoUrl !== undefined) {
      profilePhotoUrl = updates.profilePhotoUrl.trim() || undefined;
    }
    if (updates.skills !== undefined) {
      const parsed: Skill[] = [];
      for (const skillInput of updates.skills) {
        const skillResult = Skill.create(skillInput);
        if (skillResult.isFailure) return Result.fail(skillResult.error!);
        parsed.push(skillResult.value!);
      }
      skills = parsed;
    }
    if (updates.projects !== undefined) {
      const parsed: ProjectHistory[] = [];
      for (const projectInput of updates.projects) {
        const projectResult = ProjectHistory.create(projectInput);
        if (projectResult.isFailure) return Result.fail(projectResult.error!);
        parsed.push(projectResult.value!);
      }
      projects = parsed;
    }
    if (updates.languages !== undefined) {
      const parsed: Language[] = [];
      for (const languageInput of updates.languages) {
        const languageResult = Language.create(languageInput);
        if (languageResult.isFailure) return Result.fail(languageResult.error!);
        parsed.push(languageResult.value!);
      }
      languages = parsed;
    }
    if (updates.industryExperience !== undefined) {
      industryExperience = [...updates.industryExperience];
    }
    if (updates.certificates !== undefined) {
      certificates = [...updates.certificates];
    }
    if (updates.selectedClients !== undefined) {
      selectedClients = [...updates.selectedClients];
    }

    return Result.ok(
      new MemberProfileSnapshot({
        firstName,
        lastName,
        email,
        title,
        yearsExperience,
        availability,
        education,
        summary,
        cvFilePath,
        profilePhotoUrl,
        skills,
        projects,
        languages,
        industryExperience,
        certificates,
        selectedClients,
      }),
    );
  }
}
