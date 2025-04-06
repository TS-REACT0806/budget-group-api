import { type DbClient } from '@/db/create-db-client';
import { NotFoundError } from '@/utils/errors';

export type GetGroupMemberDataArgs = {
  dbClient: DbClient;
  id: string;
};

export async function getGroupMemberData({ dbClient, id }: GetGroupMemberDataArgs) {
  const record = await dbClient
    .selectFrom('group_members')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  if (!record) {
    throw new NotFoundError('Group member not found.');
  }

  return record;
}
