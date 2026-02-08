-- CreateEnum
CREATE TYPE "kyc_status" AS ENUM ('NOT_STARTED', 'PENDING', 'UNDER_REVIEW', 'ACTIVE', 'REJECTED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "kyc_status" "kyc_status" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN "kyc_provider_user_id" TEXT;
