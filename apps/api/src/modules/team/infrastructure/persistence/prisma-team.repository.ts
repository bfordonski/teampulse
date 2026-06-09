import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { Team } from '../../domain/entities/team.entity';
import { ITeamRepository } from '../../domain/repositories/team.repository';
import { TeamId } from '../../domain/value-objects/team-id.vo';
import { TeamPrismaMapper } from './team.prisma-mapper';

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
          create: data.members.map((m) => ({
            id: m.id,
            candidateId: m.candidateId,
            role: m.role,
            isLead: m.isLead,
            joinedAt: m.joinedAt,
          })),
        },
      },
      update: {
        name: data.name,
        description: data.description,
        status: data.status as never,
        members: {
          deleteMany: {},
          create: data.members.map((m) => ({
            id: m.id,
            candidateId: m.candidateId,
            role: m.role,
            isLead: m.isLead,
            joinedAt: m.joinedAt,
          })),
        },
      },
    });
  }

  async findById(id: TeamId): Promise<Team | null> {
    const record = await this.prisma.team.findUnique({
      where: { id: id.toString() },
      include: { members: true },
    });
    if (!record) return null;
    return TeamPrismaMapper.toDomain(record);
  }

  async findAll(): Promise<Team[]> {
    const records = await this.prisma.team.findMany({
      include: { members: true },
      orderBy: { name: 'asc' },
    });
    return records.map((r) => TeamPrismaMapper.toDomain(r));
  }

  async delete(id: TeamId): Promise<void> {
    await this.prisma.team.delete({ where: { id: id.toString() } });
  }
}
