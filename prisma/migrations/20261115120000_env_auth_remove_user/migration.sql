-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_userId_fkey";

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "userId" SET DEFAULT 'lawyer';

-- DropTable
DROP TABLE "User";

