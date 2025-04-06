import { type DbClient } from '@/db/create-db-client';
import { type CreateGroupMember } from './schema';

export type CreateGroupMemberDataArgs = {
  dbClient: DbClient;
  values: CreateGroupMember;
};

export async function createGroupMemberData({ dbClient, values }: CreateGroupMemberDataArgs) {
  const createdRecord = await dbClient
    .insertInto('group_members')
    .values(values)
    .returningAll()
    .executeTakeFirstOrThrow();
  return createdRecord;
}
