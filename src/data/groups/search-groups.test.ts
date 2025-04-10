import { type DbClient } from '@/db/create-db-client';
import { type Group } from '@/db/schema';
import { describe, expect } from 'vitest';
import { testWithDbClient } from '../__test-utils__/test-with-db-client';
import { createTestGroupsInDB, makeFakeGroup } from './__test-utils__/make-fake-group';
import { searchGroupsData } from './search-groups';

const mockGroup1 = makeFakeGroup({ name: 'Travel Group', description: 'For travel expenses' });
const mockGroup2 = makeFakeGroup({ name: 'Home Expenses', description: 'For home-related costs' });
const mockGroup3 = makeFakeGroup({ name: 'Entertainment', description: 'Movies, events, etc.' });

const setupTestData = async ({
  dbClient,
  group1Overrides,
  group2Overrides,
  group3Overrides,
}: {
  dbClient: DbClient;
  group1Overrides?: Partial<Group>;
  group2Overrides?: Partial<Group>;
  group3Overrides?: Partial<Group>;
}) => {
  await createTestGroupsInDB({
    dbClient,
    values: [
      { ...mockGroup1, ...group1Overrides },
      { ...mockGroup2, ...group2Overrides },
      { ...mockGroup3, ...group3Overrides },
    ],
  });
};

describe('Search Groups', () => {
  testWithDbClient('should search groups with pagination', async ({ dbClient }) => {
    await setupTestData({ dbClient });

    const result = await searchGroupsData({
      dbClient,
      limit: 10,
      page: 1,
    });

    expect(result.records).toHaveLength(3);
    expect(result.total_records).toBe(3);
    expect(result.current_page).toBe(1);
  });

  testWithDbClient('should return empty array when no groups exist', async ({ dbClient }) => {
    const result = await searchGroupsData({ dbClient });

    expect(result.records).toHaveLength(0);
    expect(result.total_records).toBe(0);
  });

  testWithDbClient('should return the correct pagination data', async ({ dbClient }) => {
    // Create 30 groups for pagination testing
    const groups = Array.from({ length: 30 }).map((_, idx) =>
      makeFakeGroup({ name: `Group ${idx}`, description: `Description ${idx}` })
    );

    await createTestGroupsInDB({
      dbClient,
      values: groups,
    });

    const result = await searchGroupsData({
      dbClient,
      limit: 25,
      page: 1,
    });

    expect(result.records).toHaveLength(25);
    expect(result.total_records).toBe(30);
    expect(result.total_pages).toBe(2);
    expect(result.current_page).toBe(1);
    expect(result.next_page).toBe(2);
    expect(result.previous_page).toBe(null);
  });

  testWithDbClient('should search groups with specific search text', async ({ dbClient }) => {
    await setupTestData({ dbClient });

    const result = await searchGroupsData({
      dbClient,
      filters: { searchText: 'Travel' },
    });

    expect(result.records).toHaveLength(1);
    expect(result.total_records).toBe(1);
    expect(result.records[0]?.name).toBe('Travel Group');
  });
});
