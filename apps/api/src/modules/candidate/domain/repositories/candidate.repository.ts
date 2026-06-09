import { Candidate } from '../entities/candidate.entity';
import { CandidateId } from '../value-objects/candidate-id.vo';

export interface CandidateFilter {
  skills?: string[];
  minSkillLevel?: number;
  minYearsExperience?: number;
  availability?: string;
  search?: string;
}

export const CANDIDATE_REPOSITORY = Symbol('CANDIDATE_REPOSITORY');

export interface ICandidateRepository {
  save(candidate: Candidate): Promise<void>;
  findById(id: CandidateId): Promise<Candidate | null>;
  findByEmail(email: string): Promise<Candidate | null>;
  findAll(filter?: CandidateFilter): Promise<Candidate[]>;
  existsByEmail(email: string): Promise<boolean>;
}
