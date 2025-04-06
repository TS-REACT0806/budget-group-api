import { type DbClient } from '@/db/create-db-client';
import { NotFoundError } from '@/utils/errors';

export type GetGroupExpenseDataArgs = {
  dbClient: DbClient;
  id: string;
};

export async function getGroupExpenseData({ dbClient, id }: GetGroupExpenseDataArgs) {
  const record = await dbClient
    .selectFrom('group_expenses')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  if (!record) {
    throw new NotFoundError('Group expense not found.');
  }

  return record;
}
