import { describe, expect } from 'vitest';
import { testWithDbClient } from '../__test-utils__/test-with-db-client';
import { createTestGroupsInDB, makeFakeGroup } from '../groups/__test-utils__/make-fake-group';
import { createTestUsersInDB, makeFakeUser } from '../users/__test-utils__/make-fake-user';
import {
  createTestGroupExpensesInDB,
  makeFakeGroupExpense,
} from './__test-utils__/make-fake-group-expense';
import { searchGroupExpensesData } from './search-group-expenses';

describe('Search Group Expenses', () => {
  testWithDbClient('should search group expenses with pagination', async ({ dbClient }) => {
    const user1 = makeFakeUser();
    const user2 = makeFakeUser();
    const group1 = makeFakeGroup({ owner_id: user1.id });
    const group2 = makeFakeGroup({ owner_id: user2.id });

    await createTestUsersInDB({ dbClient, values: [user1, user2] });
    await createTestGroupsInDB({ dbClient, values: [group1, group2] });

    const groupExpenses = [
      makeFakeGroupExpense({ owner_id: user1.id, group_id: group1.id, description: 'Dinner' }),
      makeFakeGroupExpense({ owner_id: user2.id, group_id: group1.id, description: 'Uber' }),
      makeFakeGroupExpense({ owner_id: user1.id, group_id: group2.id, description: 'Movie' }),
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
    const user1 = makeFakeUser();
    const user2 = makeFakeUser();
    const group1 = makeFakeGroup({ owner_id: user1.id });
    const group2 = makeFakeGroup({ owner_id: user2.id });

    await createTestUsersInDB({ dbClient, values: [user1, user2] });
    await createTestGroupsInDB({ dbClient, values: [group1, group2] });

    const groupExpenses = [
      makeFakeGroupExpense({ owner_id: user1.id, group_id: group1.id }),
      makeFakeGroupExpense({ owner_id: user2.id, group_id: group1.id }),
      makeFakeGroupExpense({ owner_id: user1.id, group_id: group2.id }),
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
    const user1 = makeFakeUser();
    const user2 = makeFakeUser();
    const group1 = makeFakeGroup({ owner_id: user1.id });
    const group2 = makeFakeGroup({ owner_id: user2.id });

    await createTestUsersInDB({ dbClient, values: [user1, user2] });
    await createTestGroupsInDB({ dbClient, values: [group1, group2] });

    const groupExpenses = [
      makeFakeGroupExpense({ owner_id: user1.id, group_id: group1.id }),
      makeFakeGroupExpense({ owner_id: user2.id, group_id: group1.id }),
      makeFakeGroupExpense({ owner_id: user1.id, group_id: group2.id }),
    ];

    await createTestGroupExpensesInDB({ dbClient, values: groupExpenses });

    const result = await searchGroupExpensesData({
      dbClient,
      filters: { ownerId: user1.id },
    });

    expect(result.records).toHaveLength(2);
    expect(result.total_records).toBe(2);
    expect(result.records.every(expense => expense.owner_id === user1.id)).toBe(true);
  });

  testWithDbClient('should filter group expenses by searchText', async ({ dbClient }) => {
    const user = makeFakeUser();
    const group = makeFakeGroup({ owner_id: user.id });

    await createTestUsersInDB({ dbClient, values: user });
    await createTestGroupsInDB({ dbClient, values: group });

    const groupExpenses = [
      makeFakeGroupExpense({
        owner_id: user.id,
        group_id: group.id,
        description: 'Dinner at restaurant',
      }),
      makeFakeGroupExpense({
        owner_id: user.id,
        group_id: group.id,
        description: 'Movie tickets',
      }),
      makeFakeGroupExpense({
        owner_id: user.id,
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
    const user = makeFakeUser();
    const group = makeFakeGroup({ owner_id: user.id });

    await createTestUsersInDB({ dbClient, values: user });
    await createTestGroupsInDB({ dbClient, values: group });

    const activeGroupExpense = makeFakeGroupExpense({
      owner_id: user.id,
      group_id: group.id,
    });

    const archivedGroupExpense = makeFakeGroupExpense({
      owner_id: user.id,
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
      const user = makeFakeUser();
      const group = makeFakeGroup({ owner_id: user.id });

      await createTestUsersInDB({ dbClient, values: user });
      await createTestGroupsInDB({ dbClient, values: group });

      const activeGroupExpense = makeFakeGroupExpense({
        owner_id: user.id,
        group_id: group.id,
      });

      const archivedGroupExpense = makeFakeGroupExpense({
        owner_id: user.id,
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
    const user = makeFakeUser();
    const group = makeFakeGroup({ owner_id: user.id });

    await createTestUsersInDB({ dbClient, values: user });
    await createTestGroupsInDB({ dbClient, values: group });

    const oldDate = new Date('2023-01-01');
    const middleDate = new Date('2023-06-15');
    const recentDate = new Date('2023-12-31');

    const expenses = [
      makeFakeGroupExpense({
        owner_id: user.id,
        group_id: group.id,
        expense_date: oldDate,
      }),
      makeFakeGroupExpense({
        owner_id: user.id,
        group_id: group.id,
        expense_date: middleDate,
      }),
      makeFakeGroupExpense({
        owner_id: user.id,
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
