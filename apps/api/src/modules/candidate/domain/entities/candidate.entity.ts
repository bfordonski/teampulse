import { AggregateRoot, Guard, Result } from '@consulting/shared-kernel';
import { CandidateCreatedEvent } from '../events/candidate-created.event';
import { Availability, AvailabilityStatus } from '../value-objects/availability.vo';
import { CandidateId } from '../value-objects/candidate-id.vo';
import { Email } from '../value-objects/email.vo';
import { Language } from '../value-objects/language.vo';
import { ProjectHistory } from '../value-objects/project-history.vo';
import { SkillCategory } from '../value-objects/skill-category.vo';
import { Skill } from '../value-objects/skill.vo';

export interface CandidateProps {
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

export interface CreateCandidateProps {
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  yearsExperience: number;
  availability?: AvailabilityStatus;
  summary?: string;
  cvFilePath?: string;
  profilePhotoUrl?: string;
  education?: string;
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

export class Candidate extends AggregateRoot<CandidateProps> {
  private constructor(props: CandidateProps, id?: CandidateId) {
    super(props, id);
  }

  get candidateId(): CandidateId {
    return this._id as CandidateId;
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

  get skills(): Skill[] {
    return [...this.props.skills];
  }

  get projects(): ProjectHistory[] {
    return [...this.props.projects];
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

  static create(props: CreateCandidateProps, id?: CandidateId): Result<Candidate> {
    const guard = Guard.combine([
      Guard.againstEmpty(props.firstName, 'firstName'),
      Guard.againstEmpty(props.lastName, 'lastName'),
      Guard.againstEmpty(props.title, 'title'),
    ]);
    if (guard.isFailure) return Result.fail(guard.error!);

    if (props.yearsExperience < 0) {
      return Result.fail('Years of experience cannot be negative');
    }

    const emailResult = Email.create(props.email);
    if (emailResult.isFailure) return Result.fail(emailResult.error!);

    const availabilityResult = Availability.create(
      props.availability ?? AvailabilityStatus.AVAILABLE,
    );
    if (availabilityResult.isFailure) return Result.fail(availabilityResult.error!);

    const skills: Skill[] = [];
    for (const skillInput of props.skills ?? []) {
      const skillResult = Skill.create(skillInput);
      if (skillResult.isFailure) return Result.fail(skillResult.error!);
      skills.push(skillResult.value!);
    }

    const projects: ProjectHistory[] = [];
    for (const projectInput of props.projects ?? []) {
      const projectResult = ProjectHistory.create(projectInput);
      if (projectResult.isFailure) return Result.fail(projectResult.error!);
      projects.push(projectResult.value!);
    }

    const languages: Language[] = [];
    for (const languageInput of props.languages ?? []) {
      const languageResult = Language.create(languageInput);
      if (languageResult.isFailure) return Result.fail(languageResult.error!);
      languages.push(languageResult.value!);
    }

    const candidate = new Candidate(
      {
        firstName: props.firstName.trim(),
        lastName: props.lastName.trim(),
        email: emailResult.value!,
        title: props.title.trim(),
        yearsExperience: props.yearsExperience,
        availability: availabilityResult.value!,
        education: props.education?.trim(),
        summary: props.summary?.trim(),
        cvFilePath: props.cvFilePath,
        profilePhotoUrl: props.profilePhotoUrl,
        skills,
        projects,
        languages,
        industryExperience: [...(props.industryExperience ?? [])],
        certificates: [...(props.certificates ?? [])],
        selectedClients: [...(props.selectedClients ?? [])],
      },
      id ?? CandidateId.create(),
    );

    candidate.addDomainEvent(
      new CandidateCreatedEvent(
        candidate.candidateId.toString(),
        candidate.email.value,
        candidate.fullName,
      ),
    );

    return Result.ok(candidate);
  }

  static reconstitute(props: CandidateProps, id: CandidateId): Candidate {
    const candidate = new Candidate(props, id);
    candidate.clearDomainEvents();
    return candidate;
  }

  updateProfile(updates: {
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
  }): Result<void> {
    if (updates.firstName !== undefined) {
      const guard = Guard.againstEmpty(updates.firstName, 'firstName');
      if (guard.isFailure) return Result.fail(guard.error!);
      this.props.firstName = updates.firstName.trim();
    }
    if (updates.lastName !== undefined) {
      const guard = Guard.againstEmpty(updates.lastName, 'lastName');
      if (guard.isFailure) return Result.fail(guard.error!);
      this.props.lastName = updates.lastName.trim();
    }
    if (updates.email !== undefined) {
      const emailResult = Email.create(updates.email);
      if (emailResult.isFailure) return Result.fail(emailResult.error!);
      this.props.email = emailResult.value!;
    }
    if (updates.title !== undefined) {
      const guard = Guard.againstEmpty(updates.title, 'title');
      if (guard.isFailure) return Result.fail(guard.error!);
      this.props.title = updates.title.trim();
    }
    if (updates.yearsExperience !== undefined) {
      if (updates.yearsExperience < 0) {
        return Result.fail('Years of experience cannot be negative');
      }
      this.props.yearsExperience = updates.yearsExperience;
    }
    if (updates.availability !== undefined) {
      const availabilityResult = Availability.create(updates.availability);
      if (availabilityResult.isFailure) return Result.fail(availabilityResult.error!);
      this.props.availability = availabilityResult.value!;
    }
    if (updates.education !== undefined) {
      this.props.education = updates.education.trim() || undefined;
    }
    if (updates.summary !== undefined) {
      this.props.summary = updates.summary.trim() || undefined;
    }
    if (updates.cvFilePath !== undefined) {
      this.props.cvFilePath = updates.cvFilePath;
    }
    if (updates.profilePhotoUrl !== undefined) {
      this.props.profilePhotoUrl = updates.profilePhotoUrl.trim() || undefined;
    }
    if (updates.skills !== undefined) {
      const skills: Skill[] = [];
      for (const skillInput of updates.skills) {
        const skillResult = Skill.create(skillInput);
        if (skillResult.isFailure) return Result.fail(skillResult.error!);
        skills.push(skillResult.value!);
      }
      this.props.skills = skills;
    }
    if (updates.projects !== undefined) {
      const projects: ProjectHistory[] = [];
      for (const projectInput of updates.projects) {
        const projectResult = ProjectHistory.create(projectInput);
        if (projectResult.isFailure) return Result.fail(projectResult.error!);
        projects.push(projectResult.value!);
      }
      this.props.projects = projects;
    }
    if (updates.languages !== undefined) {
      const languages: Language[] = [];
      for (const languageInput of updates.languages) {
        const languageResult = Language.create(languageInput);
        if (languageResult.isFailure) return Result.fail(languageResult.error!);
        languages.push(languageResult.value!);
      }
      this.props.languages = languages;
    }
    if (updates.industryExperience !== undefined) {
      this.props.industryExperience = [...updates.industryExperience];
    }
    if (updates.certificates !== undefined) {
      this.props.certificates = [...updates.certificates];
    }
    if (updates.selectedClients !== undefined) {
      this.props.selectedClients = [...updates.selectedClients];
    }

    return Result.ok();
  }

  addSkill(skillInput: {
    name: string;
    category?: SkillCategory;
    level?: number;
    yearsUsed?: number;
  }): Result<void> {
    const skillResult = Skill.create(skillInput);
    if (skillResult.isFailure) return Result.fail(skillResult.error!);

    const exists = this.props.skills.some(
      (s) =>
        s.matchesSkillName(skillResult.value!.name) &&
        s.category === skillResult.value!.category,
    );
    if (exists) {
      return Result.fail(`Skill "${skillInput.name}" already exists on this candidate`);
    }

    this.props.skills.push(skillResult.value!);
    return Result.ok();
  }

  hasSkills(requiredSkills: string[], minLevel = 1): boolean {
    return requiredSkills.every((required) =>
      this.props.skills.some(
        (skill) => skill.matchesSkillName(required) && skill.hasMinimumLevel(minLevel),
      ),
    );
  }

  meetsMinimumExperience(years: number): boolean {
    return this.props.yearsExperience >= years;
  }
}
