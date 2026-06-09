import { Guard, Result, ValueObject } from '@consulting/shared-kernel';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(props: EmailProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(email: string): Result<Email> {
    const guard = Guard.combine([
      Guard.againstEmpty(email, 'email'),
    ]);
    if (guard.isFailure) return Result.fail(guard.error!);

    const normalized = email.trim().toLowerCase();
    if (!Email.EMAIL_REGEX.test(normalized)) {
      return Result.fail('Invalid email format');
    }

    return Result.ok(new Email({ value: normalized }));
  }
}
