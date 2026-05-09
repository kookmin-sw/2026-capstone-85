CREATE TYPE "AssetPurpose" AS ENUM ('COMPANY_LOGO');

CREATE TYPE "AssetStatus" AS ENUM ('PENDING', 'READY');

ALTER TABLE "Company" DROP COLUMN "logoUrl",
ADD COLUMN "logoAssetId" TEXT;

CREATE TABLE "Asset" (
  "id" TEXT NOT NULL,
  "purpose" "AssetPurpose" NOT NULL,
  "status" "AssetStatus" NOT NULL DEFAULT 'PENDING',
  "bucket" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "publicUrl" TEXT NOT NULL,
  "contentType" TEXT NOT NULL,
  "byteSize" INTEGER NOT NULL,
  "originalName" TEXT,
  "uploadedById" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Company_logoAssetId_key" ON "Company"("logoAssetId");
CREATE UNIQUE INDEX "Asset_key_key" ON "Asset"("key");
CREATE INDEX "Asset_companyId_purpose_status_idx" ON "Asset"("companyId", "purpose", "status");
CREATE INDEX "Asset_uploadedById_status_idx" ON "Asset"("uploadedById", "status");

ALTER TABLE "Company"
  ADD CONSTRAINT "Company_logoAssetId_fkey"
  FOREIGN KEY ("logoAssetId") REFERENCES "Asset"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Asset"
  ADD CONSTRAINT "Asset_uploadedById_fkey"
  FOREIGN KEY ("uploadedById") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Asset"
  ADD CONSTRAINT "Asset_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
