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
import { searchGroupExpensesData } from './search-group-expenses';

describe('Search Group Expenses', () => {
  testWithDbClient('should search group expenses with pagination', async ({ dbClient }) => {
    const group1 = makeFakeGroup();
    const group2 = makeFakeGroup();
    const user1 = makeFakeGroupMember({ group_id: group1.id });
    const user2 = makeFakeGroupMember({ group_id: group1.id });

    await createTestGroupsInDB({ dbClient, values: [group1, group2] });
    await createTestGroupMembersInDB({ dbClient, values: [user1, user2] });

    const groupExpenses = [
      makeFakeGroupExpense({ member_id: user1.id, group_id: group1.id, description: 'Dinner' }),
      makeFakeGroupExpense({ member_id: user2.id, group_id: group1.id, description: 'Uber' }),
      makeFakeGroupExpense({ member_id: user1.id, group_id: group2.id, description: 'Movie' }),
    ];

    await createTestGroupExpensesInDB({ dbClient, values: groupExpenses });

    const result = await searchGroupExpensesData({
      dbClient,
      limit: 10,
      page: 1,
    });

    expect(result.records).toHaveLength(3);
    expect(result.total_records).toBe(3);
    expect(result.current_page).toBe(1);
  });

  testWithDbClient('should filter group expenses by groupId', async ({ dbClient }) => {
    const group1 = makeFakeGroup();
    const group2 = makeFakeGroup();
    const user1 = makeFakeGroupMember({ group_id: group1.id });
    const user2 = makeFakeGroupMember({ group_id: group1.id });

    await createTestGroupsInDB({ dbClient, values: [group1, group2] });
    await createTestGroupMembersInDB({ dbClient, values: [user1, user2] });

    const groupExpenses = [
      makeFakeGroupExpense({ member_id: user1.id, group_id: group1.id }),
      makeFakeGroupExpense({ member_id: user2.id, group_id: group1.id }),
      makeFakeGroupExpense({ member_id: user1.id, group_id: group2.id }),
    ];

    await createTestGroupExpensesInDB({ dbClient, values: groupExpenses });

    const result = await searchGroupExpensesData({
      dbClient,
      filters: { groupId: group1.id },
    });

    expect(result.records).toHaveLength(2);
    expect(result.total_records).toBe(2);
    expect(result.records.every(expense => expense.group_id === group1.id)).toBe(true);
  });

  testWithDbClient('should filter group expenses by ownerId', async ({ dbClient }) => {
    const group1 = makeFakeGroup();
    const group2 = makeFakeGroup();
    const user1 = makeFakeGroupMember({ group_id: group1.id });
    const user2 = makeFakeGroupMember({ group_id: group1.id });

    await createTestGroupsInDB({ dbClient, values: [group1, group2] });
    await createTestGroupMembersInDB({ dbClient, values: [user1, user2] });

    const groupExpenses = [
      makeFakeGroupExpense({ member_id: user1.id, group_id: group1.id }),
      makeFakeGroupExpense({ member_id: user2.id, group_id: group1.id }),
      makeFakeGroupExpense({ member_id: user1.id, group_id: group2.id }),
    ];

    await createTestGroupExpensesInDB({ dbClient, values: groupExpenses });

    const result = await searchGroupExpensesData({
      dbClient,
      filters: { memberId: user1.id },
    });

    expect(result.records).toHaveLength(2);
    expect(result.total_records).toBe(2);
    expect(result.records.every(expense => expense.member_id === user1.id)).toBe(true);
  });

  testWithDbClient('should filter group expenses by searchText', async ({ dbClient }) => {
    const group = makeFakeGroup();
    const user = makeFakeGroupMember({ group_id: group.id });

    await createTestGroupsInDB({ dbClient, values: group });
    await createTestGroupMembersInDB({ dbClient, values: user });

    const groupExpenses = [
      makeFakeGroupExpense({
        member_id: user.id,
        group_id: group.id,
        description: 'Dinner at restaurant',
      }),
      makeFakeGroupExpense({
        member_id: user.id,
        group_id: group.id,
        description: 'Movie tickets',
      }),
      makeFakeGroupExpense({
        member_id: user.id,
        group_id: group.id,
        description: 'Coffee shop',
      }),
    ];

    await createTestGroupExpensesInDB({ dbClient, values: groupExpenses });

    const result = await searchGroupExpensesData({
      dbClient,
      filters: { searchText: 'movie' },
    });

    expect(result.records).toHaveLength(1);
    expect(result.total_records).toBe(1);
    expect(result.records[0]?.description).toContain('Movie');
  });

  testWithDbClient('should exclude archived group expenses by default', async ({ dbClient }) => {
    const group = makeFakeGroup();
    const user = makeFakeGroupMember({ group_id: group.id });

    await createTestGroupsInDB({ dbClient, values: group });
    await createTestGroupMembersInDB({ dbClient, values: user });

    const activeGroupExpense = makeFakeGroupExpense({
      member_id: user.id,
      group_id: group.id,
    });

    const archivedGroupExpense = makeFakeGroupExpense({
      member_id: user.id,
      group_id: group.id,
      deleted_at: new Date(),
    });

    await createTestGroupExpensesInDB({
      dbClient,
      values: [activeGroupExpense, archivedGroupExpense],
    });

    const result = await searchGroupExpensesData({ dbClient });

    expect(result.records).toHaveLength(1);
    expect(result.total_records).toBe(1);
    expect(result.records[0]?.id).toEqual(activeGroupExpense.id);
  });

  testWithDbClient(
    'should include archived group expenses when includeArchived is true',
    async ({ dbClient }) => {
      const group = makeFakeGroup();
      const user = makeFakeGroupMember({ group_id: group.id });

      await createTestGroupsInDB({ dbClient, values: group });
      await createTestGroupMembersInDB({ dbClient, values: user });

      const activeGroupExpense = makeFakeGroupExpense({
        member_id: user.id,
        group_id: group.id,
      });

      const archivedGroupExpense = makeFakeGroupExpense({
        member_id: user.id,
        group_id: group.id,
        deleted_at: new Date(),
      });

      await createTestGroupExpensesInDB({
        dbClient,
        values: [activeGroupExpense, archivedGroupExpense],
      });

      const result = await searchGroupExpensesData({
        dbClient,
        includeArchived: true,
      });

      expect(result.records).toHaveLength(2);
      expect(result.total_records).toBe(2);
    }
  );

  testWithDbClient('should filter by date range', async ({ dbClient }) => {
    const group = makeFakeGroup();
    const user = makeFakeGroupMember({ group_id: group.id });

    await createTestGroupsInDB({ dbClient, values: group });
    await createTestGroupMembersInDB({ dbClient, values: user });

    const oldDate = new Date('2023-01-01');
    const middleDate = new Date('2023-06-15');
    const recentDate = new Date('2023-12-31');

    const expenses = [
      makeFakeGroupExpense({
        member_id: user.id,
        group_id: group.id,
        expense_date: oldDate,
      }),
      makeFakeGroupExpense({
        member_id: user.id,
        group_id: group.id,
        expense_date: middleDate,
      }),
      makeFakeGroupExpense({
        member_id: user.id,
        group_id: group.id,
        expense_date: recentDate,
      }),
    ];

    await createTestGroupExpensesInDB({ dbClient, values: expenses });

    const result = await searchGroupExpensesData({
      dbClient,
      filters: {
        startDate: new Date('2023-06-01'),
        endDate: new Date('2023-12-01'),
      },
    });

    expect(result.records).toHaveLength(1);
    expect(result.total_records).toBe(1);
    expect(result.records[0]?.expense_date).toEqual(middleDate);
  });
});
