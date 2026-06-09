import { UniqueEntityId } from '@consulting/shared-kernel';

export class TeamId extends UniqueEntityId {
  private constructor(id?: string) {
    super(id);
  }

  static create(id?: string): TeamId {
    return new TeamId(id);
  }
}
