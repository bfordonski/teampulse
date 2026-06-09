import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { Candidate } from '../../domain/entities/candidate.entity';
import {
  CandidateFilter,
  ICandidateRepository,
} from '../../domain/repositories/candidate.repository';
import { CandidateFilterDomainService } from '../../domain/services/candidate-filter.domain-service';
import { CandidateId } from '../../domain/value-objects/candidate-id.vo';
import { CandidatePrismaMapper } from './candidate.prisma-mapper';

const candidateInclude = {
  skills: true,
  projects: true,
  languages: true,
  industries: true,
  certificates: true,
  selectedClients: true,
} as const;

@Injectable()
export class PrismaCandidateRepository implements ICandidateRepository {
  private readonly filterService = new CandidateFilterDomainService();

  constructor(private readonly prisma: PrismaService) {}

  async save(candidate: Candidate): Promise<void> {
    const data = CandidatePrismaMapper.toPersistence(candidate);

    await this.prisma.candidate.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        title: data.title,
        yearsExperience: data.yearsExperience,
        availability: data.availability as never,
        education: data.education,
        summary: data.summary,
        cvFilePath: data.cvFilePath,
        skills: {
          create: data.skills.map((s) => ({
            name: s.name,
            category: s.category as never,
            level: s.level,
            yearsUsed: s.yearsUsed,
          })),
        },
        projects: {
          create: data.projects.map((p) => ({
            name: p.name,
            role: p.role,
            client: p.client,
            description: p.description,
            startYear: p.startYear,
            endYear: p.endYear,
          })),
        },
        languages: {
          create: data.languages,
        },
        industries: {
          create: data.industries,
        },
        certificates: {
          create: data.certificates,
        },
        selectedClients: {
          create: data.selectedClients,
        },
      },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        title: data.title,
        yearsExperience: data.yearsExperience,
        availability: data.availability as never,
        education: data.education,
        summary: data.summary,
        cvFilePath: data.cvFilePath,
        skills: {
          deleteMany: {},
          create: data.skills.map((s) => ({
            name: s.name,
            category: s.category as never,
            level: s.level,
            yearsUsed: s.yearsUsed,
          })),
        },
        projects: {
          deleteMany: {},
          create: data.projects.map((p) => ({
            name: p.name,
            role: p.role,
            client: p.client,
            description: p.description,
            startYear: p.startYear,
            endYear: p.endYear,
          })),
        },
        languages: {
          deleteMany: {},
          create: data.languages,
        },
        industries: {
          deleteMany: {},
          create: data.industries,
        },
        certificates: {
          deleteMany: {},
          create: data.certificates,
        },
        selectedClients: {
          deleteMany: {},
          create: data.selectedClients,
        },
      },
    });
  }

  async findById(id: CandidateId): Promise<Candidate | null> {
    const record = await this.prisma.candidate.findUnique({
      where: { id: id.toString() },
      include: candidateInclude,
    });
    if (!record) return null;
    return CandidatePrismaMapper.toDomain(record);
  }

  async findByEmail(email: string): Promise<Candidate | null> {
    const record = await this.prisma.candidate.findUnique({
      where: { email: email.toLowerCase() },
      include: candidateInclude,
    });
    if (!record) return null;
    return CandidatePrismaMapper.toDomain(record);
  }

  async findAll(filter?: CandidateFilter): Promise<Candidate[]> {
    const records = await this.prisma.candidate.findMany({
      include: candidateInclude,
      orderBy: { lastName: 'asc' },
    });

    const candidates = records.map((r) => CandidatePrismaMapper.toDomain(r));
    if (!filter) return candidates;

    return this.filterService.filter(candidates, filter);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.candidate.count({
      where: { email: email.toLowerCase() },
    });
    return count > 0;
  }
}
