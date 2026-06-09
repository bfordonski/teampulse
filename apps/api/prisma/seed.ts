import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient, SkillCategory } from '@prisma/client';

const prisma = new PrismaClient();

interface TestCandidateJson {
  name: string;
  position: string;
  keySkills: string[];
  businessSkills: string[];
  technologySkills: string[];
  languages: Array<{ language: string; level: string }>;
  industryExperience: string[];
  certificates: string[];
  education: string;
  summary: string;
  projects: Array<{
    type: string;
    description: string;
    role: string;
  }>;
  selectedClients: string[];
}

const YEARS_BY_NAME: Record<string, number> = {
  'Anna Kowalczyk': 9,
  'Piotr Nowak': 4,
  'Tomasz Zieliński': 6,
  'Karolina Mazur': 5,
  'Michał Kaczmarek': 7,
};

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: parts[0] };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

function emailFromName(fullName: string): string {
  const normalized = fullName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '.');
  return `${normalized}@consulting-platform.local`;
}

function loadTestCandidates(): TestCandidateJson[] {
  const filePath = join(__dirname, '../src/tests/test_candidates.json');
  return JSON.parse(readFileSync(filePath, 'utf-8')) as TestCandidateJson[];
}

async function seedCandidates(records: TestCandidateJson[]) {
  const candidateIds: string[] = [];

  for (const record of records) {
    const { firstName, lastName } = splitName(record.name);
    const email = emailFromName(record.name);
    const yearsExperience = YEARS_BY_NAME[record.name] ?? 5;

    const candidate = await prisma.candidate.upsert({
      where: { email },
      update: {
        firstName,
        lastName,
        title: record.position,
        yearsExperience,
        education: record.education,
        summary: record.summary,
        skills: {
          deleteMany: {},
          create: [
            ...record.keySkills.map((name) => ({
              name,
              category: SkillCategory.KEY,
            })),
            ...record.businessSkills.map((name) => ({
              name,
              category: SkillCategory.BUSINESS,
            })),
            ...record.technologySkills.map((name) => ({
              name,
              category: SkillCategory.TECHNOLOGY,
            })),
          ],
        },
        projects: {
          deleteMany: {},
          create: record.projects.map((project) => ({
            name: project.type,
            role: project.role,
            description: project.description,
          })),
        },
        languages: {
          deleteMany: {},
          create: record.languages,
        },
        industries: {
          deleteMany: {},
          create: record.industryExperience.map((name) => ({ name })),
        },
        certificates: {
          deleteMany: {},
          create: record.certificates.map((name) => ({ name })),
        },
        selectedClients: {
          deleteMany: {},
          create: record.selectedClients.map((name) => ({ name })),
        },
      },
      create: {
        firstName,
        lastName,
        email,
        title: record.position,
        yearsExperience,
        availability: 'AVAILABLE',
        education: record.education,
        summary: record.summary,
        skills: {
          create: [
            ...record.keySkills.map((name) => ({
              name,
              category: SkillCategory.KEY,
            })),
            ...record.businessSkills.map((name) => ({
              name,
              category: SkillCategory.BUSINESS,
            })),
            ...record.technologySkills.map((name) => ({
              name,
              category: SkillCategory.TECHNOLOGY,
            })),
          ],
        },
        projects: {
          create: record.projects.map((project) => ({
            name: project.type,
            role: project.role,
            description: project.description,
          })),
        },
        languages: {
          create: record.languages,
        },
        industries: {
          create: record.industryExperience.map((name) => ({ name })),
        },
        certificates: {
          create: record.certificates.map((name) => ({ name })),
        },
        selectedClients: {
          create: record.selectedClients.map((name) => ({ name })),
        },
      },
    });

    candidateIds.push(candidate.id);
    console.log(`Seeded candidate: ${record.name} (${candidate.id})`);
  }

  return candidateIds;
}

async function seedDemoTeam(candidateIds: string[]) {
  const annaId = candidateIds[0];
  const tomaszId = candidateIds[2];

  const team = await prisma.team.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    update: {
      name: 'Acme Digital Squad',
      description: 'Core delivery team for Acme proposal',
      status: 'DRAFT',
      members: {
        deleteMany: {},
        create: [
          {
            candidateId: annaId,
            role: 'Tech Lead',
            isLead: true,
          },
          {
            candidateId: tomaszId,
            role: 'DevOps Engineer',
            isLead: false,
          },
        ],
      },
    },
    create: {
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Acme Digital Squad',
      description: 'Core delivery team for Acme proposal',
      status: 'DRAFT',
      members: {
        create: [
          {
            candidateId: annaId,
            role: 'Tech Lead',
            isLead: true,
          },
          {
            candidateId: tomaszId,
            role: 'DevOps Engineer',
            isLead: false,
          },
        ],
      },
    },
  });

  console.log(`Seeded team: ${team.name} (${team.id})`);
}

async function main() {
  const records = loadTestCandidates();
  const candidateIds = await seedCandidates(records);
  await seedDemoTeam(candidateIds);
  console.log(`Seed complete: ${candidateIds.length} candidates`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
