import { type DbClient } from '@/db/create-db-client';
import { type CreateGroup } from './schema';

export type CreateGroupDataArgs = {
  dbClient: DbClient;
  values: CreateGroup;
};

export async function createGroupData({ dbClient, values }: CreateGroupDataArgs) {
  const createdRecord = await dbClient
    .insertInto('groups')
    .values(values)
    .returningAll()
    .executeTakeFirstOrThrow();
  return createdRecord;
}
