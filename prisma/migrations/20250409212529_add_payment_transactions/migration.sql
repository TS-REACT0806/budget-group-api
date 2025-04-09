/*
  Warnings:

  - A unique constraint covering the columns `[group_id,user_id]` on the table `group_members` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "GroupPaymentTransactionStatus" AS ENUM ('REQUESTED', 'PAID', 'REJECTED', 'VOIDED');

-- CreateTable
CREATE TABLE "group_payment_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "status" "GroupPaymentTransactionStatus" NOT NULL DEFAULT 'REQUESTED',
    "group_id" UUID NOT NULL,
    "sender_member_id" UUID NOT NULL,
    "receiver_member_id" UUID NOT NULL,

    CONSTRAINT "group_payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "group_payment_transactions_created_at_idx" ON "group_payment_transactions"("created_at");

-- CreateIndex
CREATE INDEX "group_payment_transactions_group_id_idx" ON "group_payment_transactions"("group_id");

-- CreateIndex
CREATE INDEX "group_payment_transactions_sender_member_id_idx" ON "group_payment_transactions"("sender_member_id");

-- CreateIndex
CREATE INDEX "group_payment_transactions_receiver_member_id_idx" ON "group_payment_transactions"("receiver_member_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_members_group_id_user_id_key" ON "group_members"("group_id", "user_id");

-- AddForeignKey
ALTER TABLE "group_payment_transactions" ADD CONSTRAINT "group_payment_transactions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_payment_transactions" ADD CONSTRAINT "group_payment_transactions_sender_member_id_fkey" FOREIGN KEY ("sender_member_id") REFERENCES "group_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_payment_transactions" ADD CONSTRAINT "group_payment_transactions_receiver_member_id_fkey" FOREIGN KEY ("receiver_member_id") REFERENCES "group_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
