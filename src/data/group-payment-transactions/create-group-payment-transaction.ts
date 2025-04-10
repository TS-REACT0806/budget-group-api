import { type DbClient } from '@/db/create-db-client';
import { type CreateGroupPaymentTransaction } from './schema';

export type CreateGroupPaymentTransactionDataArgs = {
  dbClient: DbClient;
  values: CreateGroupPaymentTransaction;
};

export async function createGroupPaymentTransactionData({
  dbClient,
  values,
}: CreateGroupPaymentTransactionDataArgs) {
  const createdRecord = await dbClient
    .insertInto('group_payment_transactions')
    .values(values)
    .returningAll()
    .executeTakeFirstOrThrow();
  return createdRecord;
}

export type CreateGroupPaymentTransactionDataResponse = Awaited<
  ReturnType<typeof createGroupPaymentTransactionData>
>;
