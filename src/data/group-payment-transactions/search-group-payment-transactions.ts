import { type DbClient } from '@/db/create-db-client';
import { type GroupPaymentTransaction } from '@/db/schema';
import { type GroupPaymentTransactionStatus } from '@/db/types';
import { makeDefaultDataListReturn } from '../make-default-list-return';

export type SearchGroupPaymentTransactionsFilters = {
  searchText?: string;
  groupId?: string;
  senderMemberId?: string;
  receiverMemberId?: string;
  status?: GroupPaymentTransactionStatus;
};

export type SearchGroupPaymentTransactionsDataArgs = {
  dbClient: DbClient;
  limit?: number;
  page?: number;
  sortBy?: keyof GroupPaymentTransaction;
  orderBy?: 'asc' | 'desc';
  includeArchived?: boolean;
  filters?: SearchGroupPaymentTransactionsFilters;
};

export async function searchGroupPaymentTransactionsData({
  dbClient,
  limit = 25,
  page = 1,
  sortBy = 'created_at',
  orderBy = 'desc',
  includeArchived = false,
  filters,
}: SearchGroupPaymentTransactionsDataArgs) {
  let baseQuery = dbClient.selectFrom('group_payment_transactions');

  if (!includeArchived) {
    baseQuery = baseQuery.where('deleted_at', 'is', null);
  }

  if (filters?.searchText) {
    baseQuery = baseQuery.where(eb =>
      eb.or([eb('description', 'ilike', `%${filters.searchText}%`)])
    );
  }

  if (filters?.groupId) {
    baseQuery = baseQuery.where('group_id', '=', filters.groupId);
  }

  if (filters?.senderMemberId) {
    baseQuery = baseQuery.where('sender_member_id', '=', filters.senderMemberId);
  }

  if (filters?.receiverMemberId) {
    baseQuery = baseQuery.where('receiver_member_id', '=', filters.receiverMemberId);
  }

  if (filters?.status) {
    baseQuery = baseQuery.where('status', '=', filters.status);
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

export type SearchGroupPaymentTransactionsDataResponse = Awaited<
  ReturnType<typeof searchGroupPaymentTransactionsData>
>;
