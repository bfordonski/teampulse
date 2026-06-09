import { UniqueEntityId } from '@consulting/shared-kernel';

export class TeamMemberId extends UniqueEntityId {
  private constructor(id?: string) {
    super(id);
  }

  static create(id?: string): TeamMemberId {
    return new TeamMemberId(id);
  }
}
