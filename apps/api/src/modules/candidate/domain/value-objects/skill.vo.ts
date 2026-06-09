import { Guard, Result, ValueObject } from '@consulting/shared-kernel';
import { SkillCategory } from './skill-category.vo';

export interface SkillProps {
  name: string;
  category: SkillCategory;
  level: number;
  yearsUsed: number;
}

export class Skill extends ValueObject<SkillProps> {
  private constructor(props: SkillProps) {
    super(props);
  }

  get name(): string {
    return this.props.name;
  }

  get category(): SkillCategory {
    return this.props.category;
  }

  get level(): number {
    return this.props.level;
  }

  get yearsUsed(): number {
    return this.props.yearsUsed;
  }

  static create(
    props: Omit<SkillProps, 'level' | 'yearsUsed' | 'category'> &
      Partial<Pick<SkillProps, 'level' | 'yearsUsed' | 'category'>>,
  ): Result<Skill> {
    const guard = Guard.combine([
      Guard.againstEmpty(props.name, 'skill name'),
    ]);
    if (guard.isFailure) return Result.fail(guard.error!);

    const level = props.level ?? 3;
    const yearsUsed = props.yearsUsed ?? 0;
    const category = props.category ?? SkillCategory.TECHNOLOGY;

    if (!Object.values(SkillCategory).includes(category)) {
      return Result.fail(`Invalid skill category: ${category}`);
    }
    if (level < 1 || level > 5) {
      return Result.fail('Skill level must be between 1 and 5');
    }
    if (yearsUsed < 0) {
      return Result.fail('Years used cannot be negative');
    }

    return Result.ok(
      new Skill({
        name: props.name.trim(),
        category,
        level,
        yearsUsed,
      }),
    );
  }

  matchesSkillName(skillName: string): boolean {
    return this.name.toLowerCase() === skillName.trim().toLowerCase();
  }

  hasMinimumLevel(minLevel: number): boolean {
    return this.level >= minLevel;
  }
}
