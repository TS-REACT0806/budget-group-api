import { type DbClient } from '@/db/create-db-client';
import { type GroupMember } from '@/db/schema';
import { makeDefaultDataListReturn } from '../make-default-list-return';

export type SearchGroupMembersFilters = {
  groupId?: string;
  userId?: string;
};

export type SearchGroupMembersDataArgs = {
  dbClient: DbClient;
  limit?: number;
  page?: number;
  sortBy?: keyof GroupMember;
  orderBy?: 'asc' | 'desc';
  includeArchived?: boolean;
  filters?: SearchGroupMembersFilters;
};

export async function searchGroupMembersData({
  dbClient,
  limit = 25,
  page = 1,
  sortBy = 'created_at',
  orderBy = 'desc',
  includeArchived = false,
  filters,
}: SearchGroupMembersDataArgs) {
  let baseQuery = dbClient.selectFrom('group_members');

  if (!includeArchived) {
    baseQuery = baseQuery.where('deleted_at', 'is', null);
  }

  if (filters?.groupId) {
    baseQuery = baseQuery.where('group_id', '=', filters.groupId);
  }

  if (filters?.userId) {
    baseQuery = baseQuery.where('user_id', '=', filters.userId);
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
