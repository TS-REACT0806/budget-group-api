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
import { updateGroupExpenseData } from './update-group-expense';

const fakeGroup = makeFakeGroup();
const fakeGroupMember = makeFakeGroupMember({ group_id: fakeGroup.id });
const fakeGroupExpense = makeFakeGroupExpense({
  member_id: fakeGroupMember.id,
  group_id: fakeGroup.id,
  amount: '100.00',
});

describe('Update Group Expense', () => {
  testWithDbClient('should update a group expense', async ({ dbClient }) => {
    await createTestGroupsInDB({ dbClient, values: fakeGroup });
    await createTestGroupMembersInDB({ dbClient, values: fakeGroupMember });
    await createTestGroupExpensesInDB({ dbClient, values: fakeGroupExpense });

    const updatedValues = {
      amount: '150.00',
      description: 'Updated description',
    };

    const updatedRecord = await updateGroupExpenseData({
      dbClient,
      id: fakeGroupExpense.id,
      values: updatedValues,
    });

    expect(updatedRecord).toBeDefined();
    expect(updatedRecord.id).toEqual(fakeGroupExpense.id);
    expect(updatedRecord.amount).toEqual(updatedValues.amount);
    expect(updatedRecord.description).toEqual(updatedValues.description);
    expect(updatedRecord.updated_at).not.toEqual(fakeGroupExpense.updated_at);

    const currentGroupExpense = await dbClient
      .selectFrom('group_expenses')
      .selectAll()
      .where('id', '=', fakeGroupExpense.id)
      .executeTakeFirst();

    expect(currentGroupExpense?.amount).toEqual(updatedValues.amount);
    expect(currentGroupExpense?.description).toEqual(updatedValues.description);
  });

  testWithDbClient('should throw NotFoundError for non-existent ID', async ({ dbClient }) => {
    await expect(
      updateGroupExpenseData({
        dbClient,
        id: faker.string.uuid(),
        values: { amount: '150.00' },
      })
    ).rejects.toThrow(NotFoundError);
  });
});
