import { type DbClient } from '@/db/create-db-client';
import { NotFoundError } from '@/utils/errors';
import { sql } from 'kysely';
import { type UpdateGroupExpense } from './schema';

export type UpdateGroupExpenseDataArgs = {
  dbClient: DbClient;
  id: string;
  values: UpdateGroupExpense;
};

export async function updateGroupExpenseData({ dbClient, id, values }: UpdateGroupExpenseDataArgs) {
  const updatedRecord = await dbClient
    .updateTable('group_expenses')
    .set({ ...values, updated_at: sql`NOW()` })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow(() => new NotFoundError('Group expense not found.'));

  return updatedRecord;
}
