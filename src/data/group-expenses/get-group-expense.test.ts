import { NotFoundError } from '@/utils/errors';
import { faker } from '@faker-js/faker';
import { describe, expect } from 'vitest';
import { testWithDbClient } from '../__test-utils__/test-with-db-client';
import { createTestGroupsInDB, makeFakeGroup } from '../groups/__test-utils__/make-fake-group';
import { createTestUsersInDB, makeFakeUser } from '../users/__test-utils__/make-fake-user';
import {
  createTestGroupExpensesInDB,
  makeFakeGroupExpense,
} from './__test-utils__/make-fake-group-expense';
import { getGroupExpenseData } from './get-group-expense';

const fakeUser = makeFakeUser();
const fakeGroup = makeFakeGroup({ owner_id: fakeUser.id });
const fakeGroupExpense = makeFakeGroupExpense({
  owner_id: fakeUser.id,
  group_id: fakeGroup.id,
});

describe('Get Group Expense', () => {
  testWithDbClient('should get a group expense by ID', async ({ dbClient }) => {
    await createTestUsersInDB({ dbClient, values: fakeUser });
    await createTestGroupsInDB({ dbClient, values: fakeGroup });
    await createTestGroupExpensesInDB({ dbClient, values: fakeGroupExpense });

    const groupExpense = await getGroupExpenseData({ dbClient, id: fakeGroupExpense.id });

    expect(groupExpense).toBeDefined();
    expect(groupExpense.id).toEqual(fakeGroupExpense.id);
    expect(groupExpense.group_id).toEqual(fakeGroupExpense.group_id);
    expect(groupExpense.owner_id).toEqual(fakeGroupExpense.owner_id);
    expect(groupExpense.amount).toEqual(fakeGroupExpense.amount);
  });

  testWithDbClient(
    'should throw a NotFoundError if group expense ID does not exist',
    async ({ dbClient }) => {
      await expect(getGroupExpenseData({ dbClient, id: faker.string.uuid() })).rejects.toThrow(
        NotFoundError
      );
    }
  );
});
