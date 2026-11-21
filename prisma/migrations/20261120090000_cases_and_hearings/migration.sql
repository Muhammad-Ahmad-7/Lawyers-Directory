-- Events are replaced by cases and their hearings.

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('ACTIVE', 'ON_HOLD', 'CLOSED');

-- CreateEnum
CREATE TYPE "HearingStatus" AS ENUM ('SCHEDULED', 'HELD', 'ADJOURNED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_userId_fkey";

-- DropTable
DROP TABLE "Event";

-- DropEnum
DROP TYPE "EventType";

-- DropEnum
DROP TYPE "EventStatus";

-- User: sign in by username; email is kept for contact only (no longer unique).
DROP INDEX "User_email_key";

ALTER TABLE "User" ADD COLUMN "phone" TEXT,
ADD COLUMN "username" TEXT;

-- Existing accounts keep working: their username becomes their (lowercased) email.
UPDATE "User" SET "username" = lower("email"), "phone" = '';

ALTER TABLE "User" ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "username" SET NOT NULL;

-- CreateTable
CREATE TABLE "cases" (
    "id" TEXT NOT NULL,
    "lawyer_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "case_number" TEXT,
    "court_name" TEXT,
    "client_name" TEXT,
    "client_phone" TEXT,
    "opposing_party" TEXT,
    "status" "CaseStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_hearings" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "hearing_date" DATE NOT NULL,
    "hearing_time" TEXT,
    "purpose" TEXT,
    "status" "HearingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_hearings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cases_lawyer_id_idx" ON "cases"("lawyer_id");

-- CreateIndex
CREATE INDEX "case_hearings_case_id_hearing_date_idx" ON "case_hearings"("case_id", "hearing_date");

-- CreateIndex
CREATE INDEX "case_hearings_hearing_date_idx" ON "case_hearings"("hearing_date");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_lawyer_id_fkey" FOREIGN KEY ("lawyer_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_hearings" ADD CONSTRAINT "case_hearings_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
