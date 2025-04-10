import { type DbClient } from '@/db/create-db-client';
import { type GroupPaymentTransaction } from '@/db/schema';
import { GroupPaymentTransactionStatus } from '@/db/types';
import { faker } from '@faker-js/faker';

export function makeFakeGroupPaymentTransaction(overrides?: Partial<GroupPaymentTransaction>) {
  return {
    id: faker.string.uuid(),
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    deleted_at: null,
    amount: faker.finance.amount(),
    description: faker.commerce.productDescription(),
    status: GroupPaymentTransactionStatus.REQUESTED,
    group_id: faker.string.uuid(),
    sender_member_id: faker.string.uuid(),
    receiver_member_id: faker.string.uuid(),
    ...overrides,
  } satisfies GroupPaymentTransaction;
}

export type CreateTestGroupPaymentTransactionsInDBArgs = {
  dbClient: DbClient;
  values?: Partial<GroupPaymentTransaction> | Partial<GroupPaymentTransaction>[];
};

export async function createTestGroupPaymentTransactionsInDB({
  dbClient,
  values,
}: CreateTestGroupPaymentTransactionsInDBArgs) {
  const fakeTransactions = Array.isArray(values)
    ? values.map(makeFakeGroupPaymentTransaction)
    : [makeFakeGroupPaymentTransaction(values)];

  const createdTransactions = await dbClient
    .insertInto('group_payment_transactions')
    .values(fakeTransactions)
    .returningAll()
    .execute();

  return createdTransactions;
}
