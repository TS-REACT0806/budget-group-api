import { type DbClient } from '@/db/create-db-client';
import { NotFoundError } from '@/utils/errors';
import { sql } from 'kysely';
import { type UpdateGroupMember } from './schema';

export type UpdateGroupMemberDataArgs = {
  dbClient: DbClient;
  id: string;
  values: UpdateGroupMember;
  groupId?: string;
};

export async function updateGroupMemberData({
  dbClient,
  id,
  values,
  groupId,
}: UpdateGroupMemberDataArgs) {
  let baseQuery = dbClient
    .updateTable('group_members')
    .set({ ...values, updated_at: sql`NOW()` })
    .where('id', '=', id)
    .returningAll();

  if (groupId) {
    baseQuery = baseQuery.where('group_id', '=', groupId);
  }

  const updatedRecord = await baseQuery.executeTakeFirstOrThrow(
    () => new NotFoundError('Group member not found.')
  );

  return updatedRecord;
}
