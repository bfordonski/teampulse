-- AlterTable
ALTER TABLE "CandidateSkill" ALTER COLUMN "category" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TeamMember" ALTER COLUMN "availability" SET DEFAULT 'AVAILABLE';
