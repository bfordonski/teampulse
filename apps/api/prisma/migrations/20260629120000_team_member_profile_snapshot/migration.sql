-- Rename candidateId to sourceCandidateId and drop FK to Candidate
ALTER TABLE "TeamMember" RENAME COLUMN "candidateId" TO "sourceCandidateId";
ALTER TABLE "TeamMember" DROP CONSTRAINT IF EXISTS "TeamMember_candidateId_fkey";

ALTER TABLE "TeamMember"
  ADD COLUMN "firstName" TEXT,
  ADD COLUMN "lastName" TEXT,
  ADD COLUMN "email" TEXT,
  ADD COLUMN "title" TEXT,
  ADD COLUMN "yearsExperience" INTEGER,
  ADD COLUMN "availability" "AvailabilityStatus",
  ADD COLUMN "education" TEXT,
  ADD COLUMN "summary" TEXT,
  ADD COLUMN "cvFilePath" TEXT;

-- Create snapshot child tables
CREATE TABLE "TeamMemberSkill" (
  "id" TEXT NOT NULL,
  "teamMemberId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" "SkillCategory" NOT NULL,
  "level" INTEGER NOT NULL DEFAULT 3,
  "yearsUsed" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "TeamMemberSkill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeamMemberProject" (
  "id" TEXT NOT NULL,
  "teamMemberId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT,
  "client" TEXT,
  "description" TEXT,
  "startYear" INTEGER,
  "endYear" INTEGER,
  CONSTRAINT "TeamMemberProject_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeamMemberLanguage" (
  "id" TEXT NOT NULL,
  "teamMemberId" TEXT NOT NULL,
  "language" TEXT NOT NULL,
  "level" TEXT NOT NULL,
  CONSTRAINT "TeamMemberLanguage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeamMemberIndustry" (
  "id" TEXT NOT NULL,
  "teamMemberId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  CONSTRAINT "TeamMemberIndustry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeamMemberCertificate" (
  "id" TEXT NOT NULL,
  "teamMemberId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  CONSTRAINT "TeamMemberCertificate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeamMemberClient" (
  "id" TEXT NOT NULL,
  "teamMemberId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  CONSTRAINT "TeamMemberClient_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TeamMemberSkill_teamMemberId_name_category_key" ON "TeamMemberSkill"("teamMemberId", "name", "category");
CREATE UNIQUE INDEX "TeamMemberLanguage_teamMemberId_language_key" ON "TeamMemberLanguage"("teamMemberId", "language");
CREATE UNIQUE INDEX "TeamMemberIndustry_teamMemberId_name_key" ON "TeamMemberIndustry"("teamMemberId", "name");
CREATE UNIQUE INDEX "TeamMemberCertificate_teamMemberId_name_key" ON "TeamMemberCertificate"("teamMemberId", "name");
CREATE UNIQUE INDEX "TeamMemberClient_teamMemberId_name_key" ON "TeamMemberClient"("teamMemberId", "name");

ALTER TABLE "TeamMemberSkill" ADD CONSTRAINT "TeamMemberSkill_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamMemberProject" ADD CONSTRAINT "TeamMemberProject_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamMemberLanguage" ADD CONSTRAINT "TeamMemberLanguage_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamMemberIndustry" ADD CONSTRAINT "TeamMemberIndustry_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamMemberCertificate" ADD CONSTRAINT "TeamMemberCertificate_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamMemberClient" ADD CONSTRAINT "TeamMemberClient_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill profile scalars from Candidate
UPDATE "TeamMember" tm
SET
  "firstName" = c."firstName",
  "lastName" = c."lastName",
  "email" = c."email",
  "title" = c."title",
  "yearsExperience" = c."yearsExperience",
  "availability" = c."availability",
  "education" = c."education",
  "summary" = c."summary",
  "cvFilePath" = c."cvFilePath"
FROM "Candidate" c
WHERE tm."sourceCandidateId" = c."id";

ALTER TABLE "TeamMember" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "TeamMember" ALTER COLUMN "lastName" SET NOT NULL;
ALTER TABLE "TeamMember" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "TeamMember" ALTER COLUMN "title" SET NOT NULL;
ALTER TABLE "TeamMember" ALTER COLUMN "yearsExperience" SET NOT NULL;
ALTER TABLE "TeamMember" ALTER COLUMN "availability" SET NOT NULL;

ALTER TABLE "TeamMember" DROP CONSTRAINT IF EXISTS "TeamMember_teamId_candidateId_key";
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_sourceCandidateId_key" UNIQUE ("teamId", "sourceCandidateId");

-- Backfill child tables from Candidate collections
INSERT INTO "TeamMemberSkill" ("id", "teamMemberId", "name", "category", "level", "yearsUsed")
SELECT gen_random_uuid()::text, tm."id", cs."name", cs."category", cs."level", cs."yearsUsed"
FROM "TeamMember" tm
JOIN "CandidateSkill" cs ON cs."candidateId" = tm."sourceCandidateId";

INSERT INTO "TeamMemberProject" ("id", "teamMemberId", "name", "role", "client", "description", "startYear", "endYear")
SELECT gen_random_uuid()::text, tm."id", cp."name", cp."role", cp."client", cp."description", cp."startYear", cp."endYear"
FROM "TeamMember" tm
JOIN "CandidateProject" cp ON cp."candidateId" = tm."sourceCandidateId";

INSERT INTO "TeamMemberLanguage" ("id", "teamMemberId", "language", "level")
SELECT gen_random_uuid()::text, tm."id", cl."language", cl."level"
FROM "TeamMember" tm
JOIN "CandidateLanguage" cl ON cl."candidateId" = tm."sourceCandidateId";

INSERT INTO "TeamMemberIndustry" ("id", "teamMemberId", "name")
SELECT gen_random_uuid()::text, tm."id", ci."name"
FROM "TeamMember" tm
JOIN "CandidateIndustry" ci ON ci."candidateId" = tm."sourceCandidateId";

INSERT INTO "TeamMemberCertificate" ("id", "teamMemberId", "name")
SELECT gen_random_uuid()::text, tm."id", cc."name"
FROM "TeamMember" tm
JOIN "CandidateCertificate" cc ON cc."candidateId" = tm."sourceCandidateId";

INSERT INTO "TeamMemberClient" ("id", "teamMemberId", "name")
SELECT gen_random_uuid()::text, tm."id", ccl."name"
FROM "TeamMember" tm
JOIN "CandidateClient" ccl ON ccl."candidateId" = tm."sourceCandidateId";
