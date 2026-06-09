import { UniqueEntityId } from './unique-entity-id';

export abstract class Entity<T> {
  protected readonly _id: UniqueEntityId;
  protected props: T;

  protected constructor(props: T, id?: UniqueEntityId) {
    this._id = id ?? new UniqueEntityId();
    this.props = props;
  }

  get id(): UniqueEntityId {
    return this._id;
  }

  equals(entity?: Entity<T>): boolean {
    if (!entity) return false;
    return this._id.equals(entity._id);
  }
}
