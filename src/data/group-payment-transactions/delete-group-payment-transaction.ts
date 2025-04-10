import { type DbClient } from '@/db/create-db-client';
import { NotFoundError } from '@/utils/errors';

export type DeleteGroupPaymentTransactionDataArgs = {
  dbClient: DbClient;
  id: string;
};

export async function deleteGroupPaymentTransactionData({
  dbClient,
  id,
}: DeleteGroupPaymentTransactionDataArgs) {
  const deletedRecord = await dbClient
    .deleteFrom('group_payment_transactions')
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow(() => new NotFoundError('Group payment transaction not found.'));

  return deletedRecord;
}

export type DeleteGroupPaymentTransactionDataResponse = Awaited<
  ReturnType<typeof deleteGroupPaymentTransactionData>
>;
