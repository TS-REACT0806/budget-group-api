/*
  Warnings:

  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SplitType" AS ENUM ('EQUAL', 'PERCENTAGE', 'EXACT');

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "mobile_no" TEXT;

-- DropTable
DROP TABLE "products";

-- CreateTable
CREATE TABLE "groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "split_type" "SplitType" NOT NULL DEFAULT 'EQUAL',
    "owner_id" UUID NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "percentage_share" DOUBLE PRECISION,
    "exact_share" DECIMAL(10,2),
    "group_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_expenses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "amount" DECIMAL(10,2) NOT NULL,
    "expense_date" TIMESTAMPTZ(6),
    "description" TEXT,
    "group_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,

    CONSTRAINT "group_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "groups_created_at_idx" ON "groups"("created_at");

-- CreateIndex
CREATE INDEX "groups_updated_at_idx" ON "groups"("updated_at");

-- CreateIndex
CREATE INDEX "groups_deleted_at_idx" ON "groups"("deleted_at");

-- CreateIndex
CREATE INDEX "groups_owner_id_idx" ON "groups"("owner_id");

-- CreateIndex
CREATE INDEX "group_members_created_at_idx" ON "group_members"("created_at");

-- CreateIndex
CREATE INDEX "group_members_updated_at_idx" ON "group_members"("updated_at");

-- CreateIndex
CREATE INDEX "group_members_deleted_at_idx" ON "group_members"("deleted_at");

-- CreateIndex
CREATE INDEX "group_members_group_id_idx" ON "group_members"("group_id");

-- CreateIndex
CREATE INDEX "group_members_user_id_idx" ON "group_members"("user_id");

-- CreateIndex
CREATE INDEX "group_expenses_created_at_idx" ON "group_expenses"("created_at");

-- CreateIndex
CREATE INDEX "group_expenses_updated_at_idx" ON "group_expenses"("updated_at");

-- CreateIndex
CREATE INDEX "group_expenses_deleted_at_idx" ON "group_expenses"("deleted_at");

-- CreateIndex
CREATE INDEX "group_expenses_owner_id_idx" ON "group_expenses"("owner_id");

-- CreateIndex
CREATE INDEX "group_expenses_group_id_idx" ON "group_expenses"("group_id");

-- CreateIndex
CREATE INDEX "group_expenses_expense_date_idx" ON "group_expenses"("expense_date");

-- CreateIndex
CREATE INDEX "users_mobile_no_idx" ON "users"("mobile_no");

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_expenses" ADD CONSTRAINT "group_expenses_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_expenses" ADD CONSTRAINT "group_expenses_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
