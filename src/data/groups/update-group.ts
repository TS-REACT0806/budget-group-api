import { type DbClient } from '@/db/create-db-client';
import { NotFoundError } from '@/utils/errors';
import { sql } from 'kysely';
import { type UpdateGroup } from './schema';

export type UpdateGroupDataArgs = {
  dbClient: DbClient;
  id: string;
  values: UpdateGroup;
};

export async function updateGroupData({ dbClient, id, values }: UpdateGroupDataArgs) {
  const updatedRecord = await dbClient
    .updateTable('groups')
    .set({ ...values, updated_at: sql`NOW()` })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow(() => new NotFoundError('Group not found.'));

  return updatedRecord;
}
