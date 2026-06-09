import { DomainEvent } from '@consulting/shared-kernel';

export class CandidateCreatedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  readonly eventName = 'candidate.created';

  constructor(
    readonly aggregateId: string,
    readonly email: string,
    readonly fullName: string,
  ) {}
}
