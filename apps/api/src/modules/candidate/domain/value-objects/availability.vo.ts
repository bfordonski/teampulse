import { Result, ValueObject } from '@consulting/shared-kernel';

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  PARTIALLY_AVAILABLE = 'PARTIALLY_AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
}

interface AvailabilityProps {
  status: AvailabilityStatus;
}

export class Availability extends ValueObject<AvailabilityProps> {
  private constructor(props: AvailabilityProps) {
    super(props);
  }

  get status(): AvailabilityStatus {
    return this.props.status;
  }

  isAvailableForAssignment(): boolean {
    return this.status !== AvailabilityStatus.UNAVAILABLE;
  }

  static create(status: AvailabilityStatus): Result<Availability> {
    if (!Object.values(AvailabilityStatus).includes(status)) {
      return Result.fail(`Invalid availability status: ${status}`);
    }
    return Result.ok(new Availability({ status }));
  }
}
