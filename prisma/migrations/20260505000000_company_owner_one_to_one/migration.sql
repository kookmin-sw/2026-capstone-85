-- Move company membership from User.companyId to a required Company owner.
-- This migration expects Company rows to be created with an ownerUserId going forward.
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_companyId_fkey";
ALTER TABLE "User" DROP COLUMN IF EXISTS "companyId";

ALTER TABLE "Company" ADD COLUMN "ownerUserId" TEXT NOT NULL;
CREATE UNIQUE INDEX "Company_ownerUserId_key" ON "Company"("ownerUserId");
ALTER TABLE "Company"
  ADD CONSTRAINT "Company_ownerUserId_fkey"
  FOREIGN KEY ("ownerUserId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
