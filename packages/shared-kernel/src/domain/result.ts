export class Result<T, E = string> {
  readonly isSuccess: boolean;
  readonly isFailure: boolean;
  readonly value?: T;
  readonly error?: E;

  private constructor(isSuccess: boolean, value?: T, error?: E) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.value = value;
    this.error = error;
  }

  static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, value);
  }

  static fail<U, Err = string>(error: Err): Result<U, Err> {
    return new Result<U, Err>(false, undefined, error);
  }
}
