import { Guard, Result, ValueObject } from '@consulting/shared-kernel';

export interface ProjectHistoryProps {
  name: string;
  role?: string;
  client?: string;
  description?: string;
  startYear?: number;
  endYear?: number;
}

export class ProjectHistory extends ValueObject<ProjectHistoryProps> {
  private constructor(props: ProjectHistoryProps) {
    super(props);
  }

  get name(): string {
    return this.props.name;
  }

  get role(): string | undefined {
    return this.props.role;
  }

  get client(): string | undefined {
    return this.props.client;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get startYear(): number | undefined {
    return this.props.startYear;
  }

  get endYear(): number | undefined {
    return this.props.endYear;
  }

  static create(props: ProjectHistoryProps): Result<ProjectHistory> {
    const guard = Guard.againstEmpty(props.name, 'project name');
    if (guard.isFailure) return Result.fail(guard.error!);

    if (props.startYear && props.endYear && props.startYear > props.endYear) {
      return Result.fail('Project start year cannot be after end year');
    }

    return Result.ok(new ProjectHistory({ ...props, name: props.name.trim() }));
  }
}
