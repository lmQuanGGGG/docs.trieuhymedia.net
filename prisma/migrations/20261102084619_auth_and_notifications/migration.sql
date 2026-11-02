-- AlterTable
ALTER TABLE "members" ADD COLUMN     "notificationsReadAt" TIMESTAMP(3),
ADD COLUMN     "passwordHash" TEXT;
