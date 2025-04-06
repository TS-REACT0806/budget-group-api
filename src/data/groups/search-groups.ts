import { type DbClient } from '@/db/create-db-client';
import { type Group } from '@/db/schema';
import { makeDefaultDataListReturn } from '../make-default-list-return';

export type SearchGroupsFilters = {
  searchText?: string;
};

export type SearchGroupsDataArgs = {
  dbClient: DbClient;
  limit?: number;
  page?: number;
  sortBy?: keyof Group;
  orderBy?: 'asc' | 'desc';
  includeArchived?: boolean;
  filters?: SearchGroupsFilters;
};

export async function searchGroupsData({
  dbClient,
  limit = 25,
  page = 1,
  sortBy = 'created_at',
  orderBy = 'desc',
  includeArchived = false,
  filters,
}: SearchGroupsDataArgs) {
  let baseQuery = dbClient.selectFrom('groups');

  if (!includeArchived) {
    baseQuery = baseQuery.where('deleted_at', 'is', null);
  }

  if (filters?.searchText) {
    baseQuery = baseQuery.where(eb =>
      eb.or([
        eb('name', 'ilike', `%${filters.searchText}%`),
        eb('description', 'ilike', `%${filters.searchText}%`),
      ])
    );
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
