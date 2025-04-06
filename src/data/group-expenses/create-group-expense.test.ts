import { describe, expect } from 'vitest';
import { testWithDbClient } from '../__test-utils__/test-with-db-client';
import { createTestGroupsInDB, makeFakeGroup } from '../groups/__test-utils__/make-fake-group';
import { createTestUsersInDB, makeFakeUser } from '../users/__test-utils__/make-fake-user';
import { makeFakeGroupExpense } from './__test-utils__/make-fake-group-expense';
import { createGroupExpenseData } from './create-group-expense';

const fakeUser = makeFakeUser();
const fakeGroup = makeFakeGroup({ owner_id: fakeUser.id });

describe('Create Group Expense', () => {
  testWithDbClient('should create a group expense', async ({ dbClient }) => {
    const fakeGroupExpense = makeFakeGroupExpense({
      owner_id: fakeUser.id,
      group_id: fakeGroup.id,
    });

    await createTestUsersInDB({ dbClient, values: fakeUser });
    await createTestGroupsInDB({ dbClient, values: fakeGroup });
    const createdGroupExpense = await createGroupExpenseData({
      dbClient,
      values: fakeGroupExpense,
    });

    expect(createdGroupExpense).toBeDefined();
    expect(createdGroupExpense?.id).toBeDefined();
    expect(createdGroupExpense?.group_id).toEqual(fakeGroupExpense.group_id);
    expect(createdGroupExpense?.owner_id).toEqual(fakeGroupExpense.owner_id);
    expect(createdGroupExpense?.amount).toEqual(fakeGroupExpense.amount);
    expect(createdGroupExpense?.created_at).toBeDefined();
    expect(createdGroupExpense?.updated_at).toBeDefined();

    const currentGroupExpenses = await dbClient.selectFrom('group_expenses').selectAll().execute();

    expect(currentGroupExpenses.length).toBe(1);
  });
});
