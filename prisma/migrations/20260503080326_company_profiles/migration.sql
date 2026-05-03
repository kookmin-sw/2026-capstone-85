-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "businessNumber" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "employeeTrend" JSONB,
ADD COLUMN     "logoUrl" TEXT;
