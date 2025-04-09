import { describe, expect } from 'vitest';
import { testWithDbClient } from '../__test-utils__/test-with-db-client';
import { createTestGroupsInDB } from './__test-utils__/make-fake-group';
import { searchGroupsData } from './search-groups';

describe('Search Groups', () => {
  testWithDbClient('should get a groups', async ({ dbClient }) => {
    const count = 10;

    await createTestGroupsInDB({
      dbClient,
      values: Array.from({ length: count }).map((_, idx) => ({
        name: `Group ${idx}`,
      })),
    });

    const { records, total_records } = await searchGroupsData({ dbClient });

    expect(records.length).toBe(count);
    expect(total_records).toBe(count);
  });

  testWithDbClient('should return empty array when no group', async ({ dbClient }) => {
    const { records, total_records } = await searchGroupsData({ dbClient });

    expect(records.length).toBe(0);
    expect(total_records).toBe(0);
  });

  testWithDbClient('should return the correct pagination data', async ({ dbClient }) => {
    const count = 100;

    await createTestGroupsInDB({
      dbClient,
      values: Array.from({ length: count }).map((_, idx) => ({
        name: `Group ${idx}`,
      })),
    });

    const { records, total_records, total_pages, current_page, next_page, previous_page } =
      await searchGroupsData({ dbClient });

    expect(records.length).toBe(25);
    expect(total_records).toBe(count);
    expect(total_pages).toBe(4);
    expect(current_page).toBe(1);
    expect(next_page).toBe(2);
    expect(previous_page).toBe(null);
  });

  testWithDbClient('should search groups with specific search text', async ({ dbClient }) => {
    const specificGroup = await createTestGroupsInDB({
      dbClient,
      values: {
        name: 'Group 1',
        description: 'Group 1 description',
      },
    });

    const { records, total_records } = await searchGroupsData({
      dbClient,
      filters: { searchText: 'Group 1' },
    });

    expect(records.length).toBe(1);
    expect(total_records).toBe(1);
    expect(records[0]?.id).toBe(specificGroup[0]?.id);
  });
});
