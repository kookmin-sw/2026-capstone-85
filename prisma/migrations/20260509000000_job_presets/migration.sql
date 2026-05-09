-- CreateTable
CREATE TABLE "CompanyMetadata" (
    "companyId" TEXT NOT NULL,
    "careerVerificationSignals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "careerVerificationNote" TEXT,
    "careerVerificationSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyMetadata_pkey" PRIMARY KEY ("companyId")
);

-- AddForeignKey
ALTER TABLE "CompanyMetadata" ADD CONSTRAINT "CompanyMetadata_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
