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
import { getGroupExpenseData } from './get-group-expense';

const fakeGroup = makeFakeGroup();
const fakeGroupMember = makeFakeGroupMember({ group_id: fakeGroup.id });
const fakeGroupExpense = makeFakeGroupExpense({
  member_id: fakeGroupMember.id,
  group_id: fakeGroup.id,
});

describe('Get Group Expense', () => {
  testWithDbClient('should get a group expense by ID', async ({ dbClient }) => {
    await createTestGroupsInDB({ dbClient, values: fakeGroup });
    await createTestGroupMembersInDB({ dbClient, values: fakeGroupMember });
    await createTestGroupExpensesInDB({ dbClient, values: fakeGroupExpense });

    const groupExpense = await getGroupExpenseData({ dbClient, id: fakeGroupExpense.id });

    expect(groupExpense).toBeDefined();
    expect(groupExpense.id).toEqual(fakeGroupExpense.id);
    expect(groupExpense.group_id).toEqual(fakeGroupExpense.group_id);
    expect(groupExpense.member_id).toEqual(fakeGroupExpense.member_id);
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
