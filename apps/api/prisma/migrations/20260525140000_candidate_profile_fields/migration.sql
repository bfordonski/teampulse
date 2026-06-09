-- CreateEnum
CREATE TYPE "SkillCategory" AS ENUM ('KEY', 'BUSINESS', 'TECHNOLOGY');

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN "education" TEXT;

-- AlterTable
ALTER TABLE "CandidateProject" ADD COLUMN "role" TEXT;

-- DropIndex
DROP INDEX "CandidateSkill_candidateId_name_key";

-- AlterTable
ALTER TABLE "CandidateSkill" ADD COLUMN "category" "SkillCategory" NOT NULL DEFAULT 'TECHNOLOGY';

-- AlterTable
ALTER TABLE "CandidateSkill" ALTER COLUMN "level" SET DEFAULT 3;
ALTER TABLE "CandidateSkill" ALTER COLUMN "yearsUsed" SET DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "CandidateSkill_candidateId_name_category_key" ON "CandidateSkill"("candidateId", "name", "category");

-- CreateTable
CREATE TABLE "CandidateLanguage" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "level" TEXT NOT NULL,

    CONSTRAINT "CandidateLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateIndustry" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CandidateIndustry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateCertificate" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CandidateCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateClient" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CandidateClient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CandidateLanguage_candidateId_language_key" ON "CandidateLanguage"("candidateId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateIndustry_candidateId_name_key" ON "CandidateIndustry"("candidateId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateCertificate_candidateId_name_key" ON "CandidateCertificate"("candidateId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateClient_candidateId_name_key" ON "CandidateClient"("candidateId", "name");

-- AddForeignKey
ALTER TABLE "CandidateLanguage" ADD CONSTRAINT "CandidateLanguage_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateIndustry" ADD CONSTRAINT "CandidateIndustry_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateCertificate" ADD CONSTRAINT "CandidateCertificate_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateClient" ADD CONSTRAINT "CandidateClient_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
