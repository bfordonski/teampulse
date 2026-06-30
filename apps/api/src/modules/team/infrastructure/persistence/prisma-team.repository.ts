import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { Team } from '../../domain/entities/team.entity';
import { ITeamRepository } from '../../domain/repositories/team.repository';
import { TeamId } from '../../domain/value-objects/team-id.vo';
import { TeamPrismaMapper } from './team.prisma-mapper';

const memberInclude = {
  skills: true,
  projects: true,
  languages: true,
  industries: true,
  certificates: true,
  selectedClients: true,
} as const;

function memberCreateInput(m: ReturnType<typeof TeamPrismaMapper.toPersistence>['members'][number]) {
  return {
    id: m.id,
    sourceCandidateId: m.sourceCandidateId,
    firstName: m.firstName,
    lastName: m.lastName,
    email: m.email,
    title: m.title,
    yearsExperience: m.yearsExperience,
    availability: m.availability as never,
    education: m.education,
    summary: m.summary,
    cvFilePath: m.cvFilePath,
    profilePhotoUrl: m.profilePhotoUrl,
    role: m.role,
    isLead: m.isLead,
    joinedAt: m.joinedAt,
    skills: { create: m.skills },
    projects: { create: m.projects },
    languages: { create: m.languages },
    industries: { create: m.industries },
    certificates: { create: m.certificates },
    selectedClients: { create: m.selectedClients },
  };
}

@Injectable()
export class PrismaTeamRepository implements ITeamRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(team: Team): Promise<void> {
    const data = TeamPrismaMapper.toPersistence(team);

    await this.prisma.team.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        name: data.name,
        description: data.description,
        status: data.status as never,
        members: {
          create: data.members.map(memberCreateInput),
        },
      },
      update: {
        name: data.name,
        description: data.description,
        status: data.status as never,
        members: {
          deleteMany: {},
          create: data.members.map(memberCreateInput),
        },
      },
    });
  }

  async findById(id: TeamId): Promise<Team | null> {
    const record = await this.prisma.team.findUnique({
      where: { id: id.toString() },
      include: {
        members: {
          include: memberInclude,
        },
      },
    });
    if (!record) return null;
    return TeamPrismaMapper.toDomain(record);
  }

  async findAll(): Promise<Team[]> {
    const records = await this.prisma.team.findMany({
      include: {
        members: {
          include: memberInclude,
        },
      },
      orderBy: { name: 'asc' },
    });
    return records.map((r) => TeamPrismaMapper.toDomain(r));
  }

  async delete(id: TeamId): Promise<void> {
    await this.prisma.team.delete({ where: { id: id.toString() } });
  }
}
