import { type DbClient } from '@/db/create-db-client';
import { type Group, type GroupExpense, type GroupMember } from '@/db/schema';
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

const mockGroup1 = makeFakeGroup();
const mockGroup2 = makeFakeGroup();
const mockMember1 = makeFakeGroupMember({ group_id: mockGroup1.id });
const mockMember2 = makeFakeGroupMember({ group_id: mockGroup1.id });
const mockExpense1 = makeFakeGroupExpense({
  member_id: mockMember1.id,
  group_id: mockGroup1.id,
  description: 'Dinner at restaurant',
  expense_date: new Date('2023-06-15'),
});
const mockExpense2 = makeFakeGroupExpense({
  member_id: mockMember2.id,
  group_id: mockGroup1.id,
  description: 'Uber ride',
  expense_date: new Date('2023-01-01'),
});
const mockExpense3 = makeFakeGroupExpense({
  member_id: mockMember1.id,
  group_id: mockGroup2.id,
  description: 'Movie tickets',
  expense_date: new Date('2023-12-31'),
});

const setupTestData = async ({
  dbClient,
  group1Overrides,
  group2Overrides,
  member1Overrides,
  member2Overrides,
  expense1Overrides,
  expense2Overrides,
  expense3Overrides,
}: {
  dbClient: DbClient;
  group1Overrides?: Partial<Group>;
  group2Overrides?: Partial<Group>;
  member1Overrides?: Partial<GroupMember>;
  member2Overrides?: Partial<GroupMember>;
  expense1Overrides?: Partial<GroupExpense>;
  expense2Overrides?: Partial<GroupExpense>;
  expense3Overrides?: Partial<GroupExpense>;
}) => {
  await createTestGroupsInDB({
    dbClient,
    values: [
      { ...mockGroup1, ...group1Overrides },
      { ...mockGroup2, ...group2Overrides },
    ],
  });

  await createTestGroupMembersInDB({
    dbClient,
    values: [
      { ...mockMember1, ...member1Overrides },
      { ...mockMember2, ...member2Overrides },
    ],
  });

  await createTestGroupExpensesInDB({
    dbClient,
    values: [
      { ...mockExpense1, ...expense1Overrides },
      { ...mockExpense2, ...expense2Overrides },
      { ...mockExpense3, ...expense3Overrides },
    ],
  });
};

describe('Search Group Expenses', () => {
  testWithDbClient('should search group expenses with pagination', async ({ dbClient }) => {
    await setupTestData({ dbClient });

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
    await setupTestData({ dbClient });

    const result = await searchGroupExpensesData({
      dbClient,
      filters: { groupId: mockGroup1.id },
    });

    expect(result.records).toHaveLength(2);
    expect(result.total_records).toBe(2);
    expect(result.records.every(expense => expense.group_id === mockGroup1.id)).toBe(true);
  });

  testWithDbClient('should filter group expenses by memberId', async ({ dbClient }) => {
    await setupTestData({ dbClient });

    const result = await searchGroupExpensesData({
      dbClient,
      filters: { memberId: mockMember1.id },
    });

    expect(result.records).toHaveLength(2);
    expect(result.total_records).toBe(2);
    expect(result.records.every(expense => expense.member_id === mockMember1.id)).toBe(true);
  });

  testWithDbClient('should filter group expenses by searchText', async ({ dbClient }) => {
    await setupTestData({ dbClient });

    const result = await searchGroupExpensesData({
      dbClient,
      filters: { searchText: 'movie' },
    });

    expect(result.records).toHaveLength(1);
    expect(result.total_records).toBe(1);
    expect(result.records[0]?.description).toContain('Movie');
  });

  testWithDbClient('should exclude archived group expenses by default', async ({ dbClient }) => {
    await setupTestData({
      dbClient,
      expense3Overrides: { deleted_at: new Date() },
    });

    const result = await searchGroupExpensesData({ dbClient });

    expect(result.records).toHaveLength(2);
    expect(result.total_records).toBe(2);
    expect(result.records.every(expense => expense.deleted_at === null)).toBe(true);
  });

  testWithDbClient(
    'should include archived group expenses when includeArchived is true',
    async ({ dbClient }) => {
      await setupTestData({
        dbClient,
        expense3Overrides: { deleted_at: new Date() },
      });

      const result = await searchGroupExpensesData({
        dbClient,
        includeArchived: true,
      });

      expect(result.records).toHaveLength(3);
      expect(result.total_records).toBe(3);
      expect(result.records.some(expense => expense.deleted_at !== null)).toBe(true);
    }
  );

  testWithDbClient('should filter by date range', async ({ dbClient }) => {
    await setupTestData({ dbClient });

    const result = await searchGroupExpensesData({
      dbClient,
      filters: {
        startDate: new Date('2023-06-01'),
        endDate: new Date('2023-12-01'),
      },
    });

    expect(result.records).toHaveLength(1);
    expect(result.total_records).toBe(1);
    expect(result.records[0]?.expense_date).toEqual(mockExpense1.expense_date);
  });
});
