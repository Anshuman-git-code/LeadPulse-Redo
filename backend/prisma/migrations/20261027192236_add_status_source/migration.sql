-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('META_LEAD_ADS', 'TEST');

-- AlterTable
ALTER TABLE "lead" ADD COLUMN     "source" "LeadSource" NOT NULL DEFAULT 'META_LEAD_ADS',
ADD COLUMN     "status" "LeadStatus" NOT NULL DEFAULT 'NEW';
