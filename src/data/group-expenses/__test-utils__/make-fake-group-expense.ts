import { type DbClient } from '@/db/create-db-client';
import { type GroupExpense } from '@/db/schema';
import { faker } from '@faker-js/faker';

export function makeFakeGroupExpense(override: Partial<GroupExpense> = {}): GroupExpense {
  return {
    id: faker.string.uuid(),
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    deleted_at: null,
    amount: faker.finance.amount({ min: 10, max: 1000, dec: 2 }),
    expense_date: faker.date.recent(),
    description: faker.lorem.sentence(),
    tag: faker.lorem.word(),
    group_id: faker.string.uuid(),
    member_id: faker.string.uuid(),
    ...override,
  };
}

export async function createTestGroupExpensesInDB({
  dbClient,
  values,
}: {
  dbClient: DbClient;
  values: GroupExpense | GroupExpense[];
}) {
  const valuesArray = Array.isArray(values) ? values : [values];
  await dbClient.insertInto('group_expenses').values(valuesArray).execute();
}
