import { type DbClient } from '@/db/create-db-client';
import { NotFoundError } from '@/utils/errors';
import { sql } from 'kysely';
import { type UpdateGroupPaymentTransaction } from './schema';

export type UpdateGroupPaymentTransactionDataArgs = {
  dbClient: DbClient;
  id: string;
  values: UpdateGroupPaymentTransaction;
};

export async function updateGroupPaymentTransactionData({
  dbClient,
  id,
  values,
}: UpdateGroupPaymentTransactionDataArgs) {
  const updatedRecord = await dbClient
    .updateTable('group_payment_transactions')
    .set({ ...values, updated_at: sql`NOW()` })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow(() => new NotFoundError('Group payment transaction not found.'));

  return updatedRecord;
}

export type UpdateGroupPaymentTransactionDataResponse = Awaited<
  ReturnType<typeof updateGroupPaymentTransactionData>
>;
