import { randomUUID } from 'crypto';

export class UniqueEntityId {
  private readonly value: string;

  constructor(id?: string) {
    this.value = id ?? randomUUID();
  }

  equals(other?: UniqueEntityId | null): boolean {
    if (!other) return false;
    return this.value === other.toString();
  }

  toString(): string {
    return this.value;
  }
}
