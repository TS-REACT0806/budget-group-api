import { type DbClient } from '@/db/create-db-client';
import { NotFoundError } from '@/utils/errors';

export type DeleteGroupExpenseDataArgs = {
  dbClient: DbClient;
  id: string;
};

export async function deleteGroupExpenseData({ dbClient, id }: DeleteGroupExpenseDataArgs) {
  const deletedRecord = await dbClient
    .deleteFrom('group_expenses')
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow(() => new NotFoundError('Group expense not found.'));

  return deletedRecord;
}
