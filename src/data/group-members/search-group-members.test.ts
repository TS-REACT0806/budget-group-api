import { type DbClient } from '@/db/create-db-client';
import { type Group, type GroupMember, type User } from '@/db/schema';
import { describe, expect } from 'vitest';
import { testWithDbClient } from '../__test-utils__/test-with-db-client';
import { createTestGroupsInDB, makeFakeGroup } from '../groups/__test-utils__/make-fake-group';
import { createTestUsersInDB, makeFakeUser } from '../users/__test-utils__/make-fake-user';
import {
  createTestGroupMembersInDB,
  makeFakeGroupMember,
} from './__test-utils__/make-fake-group-member';
import { searchGroupMembersData } from './search-group-members';

const mockGroup = makeFakeGroup();
const mockUser1 = makeFakeUser();
const mockUser2 = makeFakeUser();
const mockUser3 = makeFakeUser();
const mockGroupMember1 = makeFakeGroupMember({ user_id: mockUser1.id, group_id: mockGroup.id });
const mockGroupMember2 = makeFakeGroupMember({ user_id: mockUser2.id, group_id: mockGroup.id });
const mockGroupMember3 = makeFakeGroupMember({ user_id: mockUser3.id, group_id: mockGroup.id });

const setupTestData = async ({
  dbClient,
  groupOverrides,
  user1Overrides,
  user2Overrides,
  user3Overrides,
  groupMember1Overrides,
  groupMember2Overrides,
  groupMember3Overrides,
}: {
  dbClient: DbClient;
  groupOverrides?: Partial<Group>;
  user1Overrides?: Partial<User>;
  user2Overrides?: Partial<User>;
  user3Overrides?: Partial<User>;
  groupMember1Overrides?: Partial<GroupMember>;
  groupMember2Overrides?: Partial<GroupMember>;
  groupMember3Overrides?: Partial<GroupMember>;
}) => {
  await createTestUsersInDB({
    dbClient,
    values: [
      { ...mockUser1, ...user1Overrides },
      { ...mockUser2, ...user2Overrides },
      { ...mockUser3, ...user3Overrides },
    ],
  });
  await createTestGroupsInDB({ dbClient, values: { ...mockGroup, ...groupOverrides } });
  await createTestGroupMembersInDB({
    dbClient,
    values: [
      { ...mockGroupMember1, ...groupMember1Overrides },
      { ...mockGroupMember2, ...groupMember2Overrides },
      { ...mockGroupMember3, ...groupMember3Overrides },
    ],
  });
};

describe('Search Group Members', () => {
  testWithDbClient('should search group members with pagination', async ({ dbClient }) => {
    await setupTestData({ dbClient });

    const result = await searchGroupMembersData({
      dbClient,
      limit: 10,
      page: 1,
    });

    expect(result.records).toHaveLength(3);
    expect(result.total_records).toBe(3);
    expect(result.current_page).toBe(1);
  });

  testWithDbClient('should filter group members by groupId', async ({ dbClient }) => {
    await setupTestData({ dbClient });

    const result = await searchGroupMembersData({
      dbClient,
      filters: { groupId: mockGroup.id },
    });

    expect(result.records).toHaveLength(3);
    expect(result.total_records).toBe(3);
    expect(result.records.every(member => member.group_id === mockGroup.id)).toBe(true);
  });

  testWithDbClient('should filter group members by userId for user1', async ({ dbClient }) => {
    await setupTestData({ dbClient });

    const result = await searchGroupMembersData({
      dbClient,
      filters: { userId: mockUser1.id },
    });

    expect(result.records).toHaveLength(1);
    expect(result.total_records).toBe(1);
    expect(result.records.every(member => member.user_id === mockUser1.id)).toBe(true);
  });

  testWithDbClient('should filter group members by userId for user2', async ({ dbClient }) => {
    await setupTestData({ dbClient });

    const result = await searchGroupMembersData({
      dbClient,
      filters: { userId: mockUser2.id },
    });

    expect(result.records).toHaveLength(1);
    expect(result.total_records).toBe(1);
    expect(result.records.every(member => member.user_id === mockUser2.id)).toBe(true);
  });

  testWithDbClient('should exclude archived group members by default', async ({ dbClient }) => {
    await setupTestData({ dbClient, groupMember3Overrides: { deleted_at: new Date() } });

    const result = await searchGroupMembersData({ dbClient });

    expect(result.records).toHaveLength(2);
    expect(result.total_records).toBe(2);
    expect(result.records.every(member => member.deleted_at === null)).toBe(true);
  });

  testWithDbClient(
    'should include archived group members when includeArchived is true',
    async ({ dbClient }) => {
      await setupTestData({ dbClient, groupMember3Overrides: { deleted_at: new Date() } });

      const result = await searchGroupMembersData({
        dbClient,
        includeArchived: true,
      });

      expect(result.records).toHaveLength(3);
      expect(result.total_records).toBe(3);
      // Not all records have deleted_at !== null, so we can't use every()
      expect(result.records.some(member => member.deleted_at !== null)).toBe(true);
    }
  );
});
