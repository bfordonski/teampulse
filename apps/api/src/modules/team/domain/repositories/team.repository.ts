import { Team } from '../entities/team.entity';
import { TeamId } from '../value-objects/team-id.vo';

export const TEAM_REPOSITORY = Symbol('TEAM_REPOSITORY');

export interface ITeamRepository {
  save(team: Team): Promise<void>;
  findById(id: TeamId): Promise<Team | null>;
  findAll(): Promise<Team[]>;
  delete(id: TeamId): Promise<void>;
}
