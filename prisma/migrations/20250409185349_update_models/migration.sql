/*
  Warnings:

  - You are about to drop the column `owner_id` on the `group_expenses` table. All the data in the column will be lost.
  - You are about to drop the column `owner_id` on the `groups` table. All the data in the column will be lost.
  - The `split_type` column on the `groups` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `member_id` to the `group_expenses` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GroupSplitType" AS ENUM ('EQUAL', 'PERCENTAGE', 'EXACT');

-- CreateEnum
CREATE TYPE "GroupMemberStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "GroupMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- DropForeignKey
ALTER TABLE "group_expenses" DROP CONSTRAINT "group_expenses_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "groups" DROP CONSTRAINT "groups_owner_id_fkey";

-- DropIndex
DROP INDEX "group_expenses_owner_id_idx";

-- DropIndex
DROP INDEX "groups_owner_id_idx";

-- AlterTable
ALTER TABLE "group_expenses" DROP COLUMN "owner_id",
ADD COLUMN     "member_id" UUID NOT NULL,
ADD COLUMN     "tag" TEXT;

-- AlterTable
ALTER TABLE "group_members" ADD COLUMN     "placeholder_assignee_name" TEXT,
ADD COLUMN     "role" "GroupMemberRole" NOT NULL DEFAULT 'MEMBER',
ADD COLUMN     "status" "GroupMemberStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "groups" DROP COLUMN "owner_id",
ADD COLUMN     "tag" TEXT,
DROP COLUMN "split_type",
ADD COLUMN     "split_type" "GroupSplitType" NOT NULL DEFAULT 'EQUAL';

-- DropEnum
DROP TYPE "SplitType";

-- CreateIndex
CREATE INDEX "group_expenses_member_id_idx" ON "group_expenses"("member_id");

-- CreateIndex
CREATE INDEX "group_expenses_tag_idx" ON "group_expenses"("tag");

-- CreateIndex
CREATE INDEX "group_members_status_idx" ON "group_members"("status");

-- CreateIndex
CREATE INDEX "group_members_role_idx" ON "group_members"("role");

-- AddForeignKey
ALTER TABLE "group_expenses" ADD CONSTRAINT "group_expenses_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "group_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
