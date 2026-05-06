CREATE TYPE "SubmissionType" AS ENUM ('CREATE', 'UPDATE');

ALTER TABLE "JobSubmission"
  ADD COLUMN "submissionType" "SubmissionType" NOT NULL DEFAULT 'CREATE',
  ADD COLUMN "targetJobId" TEXT;

CREATE INDEX "JobSubmission_targetJobId_status_idx"
  ON "JobSubmission"("targetJobId", "status");

CREATE UNIQUE INDEX "JobSubmission_targetJobId_pending_update_key"
  ON "JobSubmission"("targetJobId")
  WHERE "submissionType" = 'UPDATE'
    AND "status" = 'PENDING'
    AND "targetJobId" IS NOT NULL;

ALTER TABLE "JobSubmission"
  ADD CONSTRAINT "JobSubmission_targetJobId_fkey"
  FOREIGN KEY ("targetJobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
