import { type DbClient } from '@/db/create-db-client';
import { NotFoundError } from '@/utils/errors';

export type GetGroupDataArgs = {
  dbClient: DbClient;
  id: string;
};

export async function getGroupData({ dbClient, id }: GetGroupDataArgs) {
  const record = await dbClient
    .selectFrom('groups')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirstOrThrow(() => new NotFoundError('Group not found.'));

  return record;
}
