import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient, SkillCategory } from '@prisma/client';
import { backfillProfilePhotos } from './backfill-profile-photos';

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
    name: string;
    description: string;
    technologies?: string;
  }>;
  selectedClients: string[];
}

const YEARS_BY_NAME: Record<string, number> = {
  'Anna Kowalczyk': 9,
  'Piotr Nowak': 4,
  'Tomasz Zieliński': 6,
  'Karolina Mazur': 5,
  'Michał Kaczmarek': 7,
  'Jakub Wiśniewski': 5,
  'Ewa Dąbrowska': 11,
  'Marcin Lewandowski': 6,
  'Agnieszka Wójcik': 5,
  'Łukasz Kamiński': 8,
  'Natalia Zając': 6,
  'Katarzyna Szymańska': 7,
  'Bartosz Król': 4,
  'Magdalena Piotrowska': 5,
  'Rafał Jankowski': 9,
  'Joanna Grabowska': 10,
  'Damian Kowalski': 7,
  'Aleksandra Nowicka': 8,
  'Szymon Walczak': 12,
  'Monika Cieślak': 5,
  'Filip Górski': 4,
  'Weronika Jastrzębska': 5,
  'Adrianna Kubiak': 8,
  'Hubert Malinowski': 10,
  'Oliwia Rutkowska': 4,
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
            name: project.name,
            description: project.description,
            technologies: project.technologies ?? null,
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
            name: project.name,
            description: project.description,
            technologies: project.technologies ?? null,
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

async function buildMemberSnapshotFromCandidate(candidateId: string) {
  const candidate = await prisma.candidate.findUniqueOrThrow({
    where: { id: candidateId },
    include: {
      skills: true,
      projects: true,
      languages: true,
      industries: true,
      certificates: true,
      selectedClients: true,
    },
  });

  return {
    sourceCandidateId: candidate.id,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email,
    title: candidate.title,
    yearsExperience: candidate.yearsExperience,
    availability: candidate.availability,
    education: candidate.education,
    summary: candidate.summary,
    cvFilePath: candidate.cvFilePath,
    profilePhotoUrl: candidate.profilePhotoUrl,
    skills: {
      create: candidate.skills.map((s) => ({
        name: s.name,
        category: s.category,
        level: s.level,
        yearsUsed: s.yearsUsed,
      })),
    },
    projects: {
      create: candidate.projects.map((p) => ({
        name: p.name,
        description: p.description,
        technologies: p.technologies,
      })),
    },
    languages: {
      create: candidate.languages.map((l) => ({
        language: l.language,
        level: l.level,
      })),
    },
    industries: {
      create: candidate.industries.map((i) => ({ name: i.name })),
    },
    certificates: {
      create: candidate.certificates.map((c) => ({ name: c.name })),
    },
    selectedClients: {
      create: candidate.selectedClients.map((c) => ({ name: c.name })),
    },
  };
}

async function seedDemoTeam(candidateIds: string[]) {
  const annaId = candidateIds[0];
  const tomaszId = candidateIds[2];

  const annaSnapshot = await buildMemberSnapshotFromCandidate(annaId);
  const tomaszSnapshot = await buildMemberSnapshotFromCandidate(tomaszId);

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
            ...annaSnapshot,
            role: 'Tech Lead',
            isLead: true,
          },
          {
            ...tomaszSnapshot,
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
            ...annaSnapshot,
            role: 'Tech Lead',
            isLead: true,
          },
          {
            ...tomaszSnapshot,
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
  await backfillProfilePhotos();
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
