import { type DbClient } from '@/db/create-db-client';
import { NotFoundError } from '@/utils/errors';

export type DeleteGroupDataArgs = {
  dbClient: DbClient;
  id: string;
};

export async function deleteGroupData({ dbClient, id }: DeleteGroupDataArgs) {
  const deletedRecord = await dbClient
    .deleteFrom('groups')
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow(() => new NotFoundError('Group not found.'));

  return deletedRecord;
}
