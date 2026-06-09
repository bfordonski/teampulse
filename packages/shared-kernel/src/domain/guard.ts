import { Result } from './result';

export class Guard {
  static againstNullOrUndefined(argument: unknown, argumentName: string): Result<true> {
    if (argument === null || argument === undefined) {
      return Result.fail(`${argumentName} is required`);
    }
    return Result.ok(true);
  }

  static againstEmpty(argument: string, argumentName: string): Result<true> {
    if (!argument || argument.trim().length === 0) {
      return Result.fail(`${argumentName} cannot be empty`);
    }
    return Result.ok(true);
  }

  static combine(results: Result<unknown>[]): Result<true> {
    for (const result of results) {
      if (result.isFailure) return Result.fail(result.error as string);
    }
    return Result.ok(true);
  }
}
