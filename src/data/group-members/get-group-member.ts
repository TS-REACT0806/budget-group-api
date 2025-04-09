import { type DbClient } from '@/db/create-db-client';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type GetGroupMemberDataArgs = {
  dbClient: DbClient;
  groupId?: string;
  id?: string;
  userId?: string;
};

export async function getGroupMemberData({
  dbClient,
  id,
  userId,
  groupId,
}: GetGroupMemberDataArgs) {
  if (!id && !userId) {
    throw new BadRequestError('Either id or userId must be provided.');
  }

  let baseQuery = dbClient.selectFrom('group_members').selectAll();

  if (id) {
    baseQuery = baseQuery.where('id', '=', id);
  }

  if (userId) {
    baseQuery = baseQuery.where('user_id', '=', userId);
  }

  if (groupId) {
    baseQuery = baseQuery.where('group_id', '=', groupId);
  }

  const record = await baseQuery.executeTakeFirst();

  if (!record) {
    throw new NotFoundError('Group member not found.');
  }

  return record;
}
