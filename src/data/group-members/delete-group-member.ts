import { type DbClient } from '@/db/create-db-client';
import { NotFoundError } from '@/utils/errors';

export type DeleteGroupMemberDataArgs = {
  dbClient: DbClient;
  id: string;
};

export async function deleteGroupMemberData({ dbClient, id }: DeleteGroupMemberDataArgs) {
  const deletedRecord = await dbClient
    .deleteFrom('group_members')
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow(() => new NotFoundError('Group member not found.'));

  return deletedRecord;
}
