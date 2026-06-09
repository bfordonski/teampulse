import { DomainEvent } from '@consulting/shared-kernel';

export class TeamMemberAddedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  readonly eventName = 'team.member_added';

  constructor(
    readonly aggregateId: string,
    readonly candidateId: string,
    readonly role: string,
  ) {}
}
