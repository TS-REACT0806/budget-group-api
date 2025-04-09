import { describe, expect } from 'vitest';
import { testWithDbClient } from '../__test-utils__/test-with-db-client';
import {
  createTestGroupMembersInDB,
  makeFakeGroupMember,
} from '../group-members/__test-utils__/make-fake-group-member';
import { createTestGroupsInDB, makeFakeGroup } from '../groups/__test-utils__/make-fake-group';
import { makeFakeGroupExpense } from './__test-utils__/make-fake-group-expense';
import { createGroupExpenseData } from './create-group-expense';

const fakeGroup = makeFakeGroup();
const fakeGroupMember = makeFakeGroupMember({ group_id: fakeGroup.id });

describe('Create Group Expense', () => {
  testWithDbClient('should create a group expense', async ({ dbClient }) => {
    const fakeGroupExpense = makeFakeGroupExpense({
      member_id: fakeGroupMember.id,
      group_id: fakeGroup.id,
    });

    await createTestGroupsInDB({ dbClient, values: fakeGroup });
    await createTestGroupMembersInDB({ dbClient, values: fakeGroupMember });

    const createdGroupExpense = await createGroupExpenseData({
      dbClient,
      values: fakeGroupExpense,
    });

    expect(createdGroupExpense).toBeDefined();
    expect(createdGroupExpense?.id).toBeDefined();
    expect(createdGroupExpense?.group_id).toEqual(fakeGroupExpense.group_id);
    expect(createdGroupExpense?.member_id).toEqual(fakeGroupExpense.member_id);
    expect(createdGroupExpense?.amount).toEqual(fakeGroupExpense.amount);
    expect(createdGroupExpense?.created_at).toBeDefined();
    expect(createdGroupExpense?.updated_at).toBeDefined();

    const currentGroupExpenses = await dbClient.selectFrom('group_expenses').selectAll().execute();

    expect(currentGroupExpenses.length).toBe(1);
  });
});
