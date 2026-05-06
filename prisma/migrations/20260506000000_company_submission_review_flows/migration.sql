-- Extend company-owned submission workflows for admin-reviewed publication.
ALTER TABLE "JobSubmission"
  ADD COLUMN "kicpaCondition" "KicpaCondition" NOT NULL DEFAULT 'UNCLEAR',
  ADD COLUMN "traineeStatus" "TraineeStatus" NOT NULL DEFAULT 'UNCLEAR',
  ADD COLUMN "practicalTrainingInstitution" BOOLEAN,
  ADD COLUMN "minExperienceYears" INTEGER,
  ADD COLUMN "maxExperienceYears" INTEGER,
  ADD COLUMN "location" TEXT,
  ADD COLUMN "approvedJobId" TEXT,
  ADD COLUMN "reviewedById" TEXT,
  ADD COLUMN "reviewedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "JobSubmission_approvedJobId_key" ON "JobSubmission"("approvedJobId");
CREATE INDEX "JobSubmission_companyId_status_idx" ON "JobSubmission"("companyId", "status");
CREATE INDEX "JobSubmission_submittedById_status_idx" ON "JobSubmission"("submittedById", "status");

ALTER TABLE "JobSubmission"
  ADD CONSTRAINT "JobSubmission_reviewedById_fkey"
  FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "JobSubmission"
  ADD CONSTRAINT "JobSubmission_approvedJobId_fkey"
  FOREIGN KEY ("approvedJobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "CompanyProfileSubmission" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "submittedById" TEXT NOT NULL,
  "proposed" JSONB NOT NULL,
  "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
  "adminNote" TEXT,
  "reviewedById" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CompanyProfileSubmission_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CompanyProfileSubmission_companyId_status_idx"
  ON "CompanyProfileSubmission"("companyId", "status");
CREATE INDEX "CompanyProfileSubmission_submittedById_status_idx"
  ON "CompanyProfileSubmission"("submittedById", "status");
CREATE UNIQUE INDEX "CompanyProfileSubmission_companyId_pending_key"
  ON "CompanyProfileSubmission"("companyId")
  WHERE "status" = 'PENDING';

ALTER TABLE "CompanyProfileSubmission"
  ADD CONSTRAINT "CompanyProfileSubmission_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CompanyProfileSubmission"
  ADD CONSTRAINT "CompanyProfileSubmission_submittedById_fkey"
  FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CompanyProfileSubmission"
  ADD CONSTRAINT "CompanyProfileSubmission_reviewedById_fkey"
  FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
