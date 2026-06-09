import { UniqueEntityId } from '@consulting/shared-kernel';

export class CandidateId extends UniqueEntityId {
  private constructor(id?: string) {
    super(id);
  }

  static create(id?: string): CandidateId {
    return new CandidateId(id);
  }
}
