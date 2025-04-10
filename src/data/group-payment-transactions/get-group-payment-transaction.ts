import { type DbClient } from '@/db/create-db-client';
import { NotFoundError } from '@/utils/errors';

export type GetGroupPaymentTransactionDataArgs = {
  dbClient: DbClient;
  id: string;
};

export async function getGroupPaymentTransactionData({
  dbClient,
  id,
}: GetGroupPaymentTransactionDataArgs) {
  const record = await dbClient
    .selectFrom('group_payment_transactions')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirstOrThrow(() => new NotFoundError('Group payment transaction not found.'));

  return record;
}

export type GetGroupPaymentTransactionDataResponse = Awaited<
  ReturnType<typeof getGroupPaymentTransactionData>
>;
