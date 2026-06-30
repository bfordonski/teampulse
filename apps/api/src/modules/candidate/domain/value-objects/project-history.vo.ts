import { Guard, Result, ValueObject } from '@consulting/shared-kernel';

export interface ProjectHistoryProps {
  name: string;
  description: string;
  technologies?: string;
}

export class ProjectHistory extends ValueObject<ProjectHistoryProps> {
  private constructor(props: ProjectHistoryProps) {
    super(props);
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get technologies(): string | undefined {
    return this.props.technologies;
  }

  static create(props: ProjectHistoryProps): Result<ProjectHistory> {
    const guard = Guard.combine([
      Guard.againstEmpty(props.name, 'project name'),
      Guard.againstEmpty(props.description, 'project description'),
    ]);
    if (guard.isFailure) return Result.fail(guard.error!);

    return Result.ok(
      new ProjectHistory({
        name: props.name.trim(),
        description: props.description.trim(),
        technologies: props.technologies?.trim() || undefined,
      }),
    );
  }
}
