import { type DbClient } from '@/db/create-db-client';
import { NotFoundError } from '@/utils/errors';
import { sql } from 'kysely';
import { type UpdateGroupMember } from './schema';

export type UpdateGroupMemberDataArgs = {
  dbClient: DbClient;
  id: string;
  values: UpdateGroupMember;
};

export async function updateGroupMemberData({ dbClient, id, values }: UpdateGroupMemberDataArgs) {
  const updatedRecord = await dbClient
    .updateTable('group_members')
    .set({ ...values, updated_at: sql`NOW()` })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow(() => new NotFoundError('Group member not found.'));

  return updatedRecord;
}
