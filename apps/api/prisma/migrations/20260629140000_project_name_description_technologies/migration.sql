-- Simplify project model: name, description, optional technologies

ALTER TABLE "CandidateProject" ADD COLUMN IF NOT EXISTS "technologies" TEXT;

UPDATE "CandidateProject"
SET "description" = COALESCE(
  NULLIF(TRIM("description"), ''),
  NULLIF(TRIM(CONCAT_WS(' — ', "role", "client")), ''),
  "name"
)
WHERE "description" IS NULL OR TRIM("description") = '';

ALTER TABLE "CandidateProject" ALTER COLUMN "description" SET NOT NULL;
ALTER TABLE "CandidateProject" ALTER COLUMN "description" SET DEFAULT '';

ALTER TABLE "CandidateProject" DROP COLUMN IF EXISTS "role";
ALTER TABLE "CandidateProject" DROP COLUMN IF EXISTS "client";
ALTER TABLE "CandidateProject" DROP COLUMN IF EXISTS "startYear";
ALTER TABLE "CandidateProject" DROP COLUMN IF EXISTS "endYear";

ALTER TABLE "TeamMemberProject" ADD COLUMN IF NOT EXISTS "technologies" TEXT;

UPDATE "TeamMemberProject"
SET "description" = COALESCE(
  NULLIF(TRIM("description"), ''),
  NULLIF(TRIM(CONCAT_WS(' — ', "role", "client")), ''),
  "name"
)
WHERE "description" IS NULL OR TRIM("description") = '';

ALTER TABLE "TeamMemberProject" ALTER COLUMN "description" SET NOT NULL;
ALTER TABLE "TeamMemberProject" ALTER COLUMN "description" SET DEFAULT '';

ALTER TABLE "TeamMemberProject" DROP COLUMN IF EXISTS "role";
ALTER TABLE "TeamMemberProject" DROP COLUMN IF EXISTS "client";
ALTER TABLE "TeamMemberProject" DROP COLUMN IF EXISTS "startYear";
ALTER TABLE "TeamMemberProject" DROP COLUMN IF EXISTS "endYear";
