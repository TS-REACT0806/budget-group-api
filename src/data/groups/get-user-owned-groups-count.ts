import { type DbClient } from '@/db/create-db-client';

export type GetUserOwnedGroupsCountDataArgs = {
  dbClient: DbClient;
  userId: string;
};

export async function getUserOwnedGroupsCountData({
  dbClient,
  userId,
}: GetUserOwnedGroupsCountDataArgs) {
  const result = await dbClient
    .selectFrom('group_members')
    .innerJoin('groups', 'groups.id', 'group_members.group_id')
    .where('group_members.user_id', '=', userId)
    .where('group_members.role', '=', 'OWNER')
    .where('group_members.deleted_at', 'is', null)
    .where('groups.deleted_at', 'is', null)
    .select(eb => eb.fn.count('groups.id').as('total_records'))
    .executeTakeFirst();

  return Number(result?.total_records ?? 0);
}
