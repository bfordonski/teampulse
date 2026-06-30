import { PrismaClient } from '@prisma/client';
import { fetchProfilePhotoUrl, sleep } from './fetch-profile-photo';

const prisma = new PrismaClient();
const REQUEST_DELAY_MS = 300;

export async function backfillProfilePhotos(): Promise<void> {
  const candidates = await prisma.candidate.findMany({
    where: { profilePhotoUrl: null },
    select: { id: true, email: true, firstName: true, lastName: true },
  });

  console.log(`Backfilling profile photos for ${candidates.length} candidate(s)...`);

  for (const candidate of candidates) {
    try {
      const profilePhotoUrl = await fetchProfilePhotoUrl(candidate.email);
      await prisma.candidate.update({
        where: { id: candidate.id },
        data: { profilePhotoUrl },
      });
      console.log(`  ✓ ${candidate.firstName} ${candidate.lastName}`);
    } catch (error) {
      console.error(
        `  ✗ ${candidate.firstName} ${candidate.lastName}:`,
        error instanceof Error ? error.message : error,
      );
    }
    await sleep(REQUEST_DELAY_MS);
  }

  const members = await prisma.teamMember.findMany({
    where: { profilePhotoUrl: null },
    select: { id: true, sourceCandidateId: true, email: true, firstName: true, lastName: true },
  });

  console.log(`Backfilling profile photos for ${members.length} team member snapshot(s)...`);

  for (const member of members) {
    try {
      const source = await prisma.candidate.findUnique({
        where: { id: member.sourceCandidateId },
        select: { profilePhotoUrl: true },
      });

      let profilePhotoUrl = source?.profilePhotoUrl ?? null;

      if (!profilePhotoUrl) {
        profilePhotoUrl = await fetchProfilePhotoUrl(member.email);
        await sleep(REQUEST_DELAY_MS);
      }

      await prisma.teamMember.update({
        where: { id: member.id },
        data: { profilePhotoUrl },
      });
      console.log(`  ✓ team member ${member.firstName} ${member.lastName}`);
    } catch (error) {
      console.error(
        `  ✗ team member ${member.firstName} ${member.lastName}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }
}

async function main() {
  await backfillProfilePhotos();
  console.log('Profile photo backfill complete.');
}

const isDirectRun = process.argv[1]?.includes('backfill-profile-photos');

if (isDirectRun) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
