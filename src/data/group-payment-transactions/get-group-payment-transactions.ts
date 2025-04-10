import { type DbClient } from '@/db/create-db-client';
import { type GroupPaymentTransaction } from '@/db/schema';
import { makeDefaultDataListReturn } from '../make-default-list-return';

export type GetGroupPaymentTransactionsDataArgs = {
  dbClient: DbClient;
  limit?: number;
  page?: number;
  sortBy?: keyof GroupPaymentTransaction;
  orderBy?: 'asc' | 'desc';
  includeArchived?: boolean;
};

export async function getGroupPaymentTransactionsData({
  dbClient,
  limit = 25,
  page = 1,
  sortBy = 'created_at',
  orderBy = 'desc',
  includeArchived = false,
}: GetGroupPaymentTransactionsDataArgs) {
  let baseQuery = dbClient.selectFrom('group_payment_transactions');

  if (!includeArchived) {
    baseQuery = baseQuery.where('deleted_at', 'is', null);
  }

  const records = await baseQuery
    .selectAll()
    .limit(limit)
    .offset((page - 1) * limit)
    .orderBy(sortBy, orderBy)
    .execute();

  const allRecords = await baseQuery
    .select(eb => eb.fn.count('id').as('total_records'))
    .executeTakeFirst();

  return makeDefaultDataListReturn({
    records,
    totalRecords: Number(allRecords?.total_records) ?? 0,
    limit,
    page,
  });
}

export type GetGroupPaymentTransactionsDataResponse = Awaited<
  ReturnType<typeof getGroupPaymentTransactionsData>
>;
