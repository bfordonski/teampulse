import { Guard, Result, ValueObject } from '@consulting/shared-kernel';

export interface LanguageProps {
  language: string;
  level: string;
}

export class Language extends ValueObject<LanguageProps> {
  private constructor(props: LanguageProps) {
    super(props);
  }

  get language(): string {
    return this.props.language;
  }

  get level(): string {
    return this.props.level;
  }

  static create(props: LanguageProps): Result<Language> {
    const guard = Guard.combine([
      Guard.againstEmpty(props.language, 'language'),
      Guard.againstEmpty(props.level, 'language level'),
    ]);
    if (guard.isFailure) return Result.fail(guard.error!);

    return Result.ok(
      new Language({
        language: props.language.trim(),
        level: props.level.trim(),
      }),
    );
  }
}
