import { Guard, Result, ValueObject } from '@consulting/shared-kernel';

export enum StandardProjectRole {
  TECH_LEAD = 'Tech Lead',
  DEVELOPER = 'Developer',
  ARCHITECT = 'Architect',
  BUSINESS_ANALYST = 'Business Analyst',
  PROJECT_MANAGER = 'Project Manager',
  QA_ENGINEER = 'QA Engineer',
  DEVOPS_ENGINEER = 'DevOps Engineer',
}

interface ProjectRoleProps {
  value: string;
}

export class ProjectRole extends ValueObject<ProjectRoleProps> {
  private constructor(props: ProjectRoleProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  isLeadRole(): boolean {
    const leadRoles = [
      StandardProjectRole.TECH_LEAD,
      StandardProjectRole.ARCHITECT,
      StandardProjectRole.PROJECT_MANAGER,
    ];
    return leadRoles.includes(this.value as StandardProjectRole);
  }

  static create(role: string): Result<ProjectRole> {
    const guard = Guard.againstEmpty(role, 'project role');
    if (guard.isFailure) return Result.fail(guard.error!);
    return Result.ok(new ProjectRole({ value: role.trim() }));
  }
}
