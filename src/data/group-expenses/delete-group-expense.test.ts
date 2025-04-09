import { NotFoundError } from '@/utils/errors';
import { faker } from '@faker-js/faker';
import { describe, expect } from 'vitest';
import { testWithDbClient } from '../__test-utils__/test-with-db-client';
import {
  createTestGroupMembersInDB,
  makeFakeGroupMember,
} from '../group-members/__test-utils__/make-fake-group-member';
import { createTestGroupsInDB, makeFakeGroup } from '../groups/__test-utils__/make-fake-group';
import {
  createTestGroupExpensesInDB,
  makeFakeGroupExpense,
} from './__test-utils__/make-fake-group-expense';
import { deleteGroupExpenseData } from './delete-group-expense';

const fakeGroup = makeFakeGroup();
const fakeGroupMember = makeFakeGroupMember({ group_id: fakeGroup.id });
const fakeGroupExpense = makeFakeGroupExpense({
  member_id: fakeGroupMember.id,
  group_id: fakeGroup.id,
});

describe('Delete Group Expense', () => {
  testWithDbClient('should delete a group expense by ID', async ({ dbClient }) => {
    await createTestGroupsInDB({ dbClient, values: fakeGroup });
    await createTestGroupMembersInDB({ dbClient, values: fakeGroupMember });
    await createTestGroupExpensesInDB({ dbClient, values: fakeGroupExpense });

    const initialGroupExpenses = await dbClient.selectFrom('group_expenses').selectAll().execute();
    expect(initialGroupExpenses.length).toBe(1);

    const deletedGroupExpense = await deleteGroupExpenseData({ dbClient, id: fakeGroupExpense.id });

    expect(deletedGroupExpense).toBeDefined();
    expect(deletedGroupExpense.id).toEqual(fakeGroupExpense.id);

    const remainingGroupExpenses = await dbClient
      .selectFrom('group_expenses')
      .selectAll()
      .execute();
    expect(remainingGroupExpenses.length).toBe(0);
  });

  testWithDbClient('should throw NotFoundError for non-existent ID', async ({ dbClient }) => {
    await expect(deleteGroupExpenseData({ dbClient, id: faker.string.uuid() })).rejects.toThrow(
      NotFoundError
    );
  });
});
