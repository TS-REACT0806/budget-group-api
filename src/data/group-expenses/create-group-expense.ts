import { type DbClient } from '@/db/create-db-client';
import { type CreateGroupExpense } from './schema';

export type CreateGroupExpenseDataArgs = {
  dbClient: DbClient;
  values: CreateGroupExpense;
};

export async function createGroupExpenseData({ dbClient, values }: CreateGroupExpenseDataArgs) {
  const createdRecord = await dbClient
    .insertInto('group_expenses')
    .values(values)
    .returningAll()
    .executeTakeFirstOrThrow();
  return createdRecord;
}
