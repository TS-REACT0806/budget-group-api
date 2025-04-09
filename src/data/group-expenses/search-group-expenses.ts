import { type DbClient } from '@/db/create-db-client';
import { type GroupExpense } from '@/db/schema';
import { makeDefaultDataListReturn } from '../make-default-list-return';

export type SearchGroupExpensesFilters = {
  searchText?: string;
  tag?: string;
  groupId?: string;
  memberId?: string;
  startDate?: Date;
  endDate?: Date;
};

export type SearchGroupExpensesDataArgs = {
  dbClient: DbClient;
  limit?: number;
  page?: number;
  sortBy?: keyof GroupExpense;
  orderBy?: 'asc' | 'desc';
  includeArchived?: boolean;
  filters?: SearchGroupExpensesFilters;
};

export async function searchGroupExpensesData({
  dbClient,
  limit = 25,
  page = 1,
  sortBy = 'created_at',
  orderBy = 'desc',
  includeArchived = false,
  filters,
}: SearchGroupExpensesDataArgs) {
  let baseQuery = dbClient.selectFrom('group_expenses');

  if (!includeArchived) {
    baseQuery = baseQuery.where('deleted_at', 'is', null);
  }

  if (filters?.tag) {
    baseQuery = baseQuery.where('tag', '=', filters.tag);
  }

  if (filters?.groupId) {
    baseQuery = baseQuery.where('group_id', '=', filters.groupId);
  }

  if (filters?.memberId) {
    baseQuery = baseQuery.where('member_id', '=', filters.memberId);
  }

  if (filters?.searchText) {
    baseQuery = baseQuery.where(eb =>
      eb.or([eb('description', 'ilike', `%${filters.searchText}%`)])
    );
  }

  if (filters?.startDate) {
    baseQuery = baseQuery.where('expense_date', '>=', filters.startDate);
  }

  if (filters?.endDate) {
    baseQuery = baseQuery.where('expense_date', '<=', filters.endDate);
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
