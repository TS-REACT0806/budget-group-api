import { describe, expect } from 'vitest';
import { testWithDbClient } from '../__test-utils__/test-with-db-client';
import { createTestGroupsInDB, makeFakeGroup } from '../groups/__test-utils__/make-fake-group';
import { createTestUsersInDB, makeFakeUser } from '../users/__test-utils__/make-fake-user';
import {
  createTestGroupMembersInDB,
  makeFakeGroupMember,
} from './__test-utils__/make-fake-group-member';
import { searchGroupMembersData } from './search-group-members';

describe('Search Group Members', () => {
  testWithDbClient('should search group members with pagination', async ({ dbClient }) => {
    const user1 = makeFakeUser();
    const user2 = makeFakeUser();
    const group1 = makeFakeGroup({ owner_id: user1.id });
    const group2 = makeFakeGroup({ owner_id: user2.id });

    await createTestUsersInDB({ dbClient, values: [user1, user2] });
    await createTestGroupsInDB({ dbClient, values: [group1, group2] });

    const groupMembers = [
      makeFakeGroupMember({ user_id: user1.id, group_id: group1.id }),
      makeFakeGroupMember({ user_id: user2.id, group_id: group1.id }),
      makeFakeGroupMember({ user_id: user1.id, group_id: group2.id }),
    ];

    await createTestGroupMembersInDB({ dbClient, values: groupMembers });

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
    const user1 = makeFakeUser();
    const user2 = makeFakeUser();
    const group1 = makeFakeGroup({ owner_id: user1.id });
    const group2 = makeFakeGroup({ owner_id: user2.id });

    await createTestUsersInDB({ dbClient, values: [user1, user2] });
    await createTestGroupsInDB({ dbClient, values: [group1, group2] });

    const groupMembers = [
      makeFakeGroupMember({ user_id: user1.id, group_id: group1.id }),
      makeFakeGroupMember({ user_id: user2.id, group_id: group1.id }),
      makeFakeGroupMember({ user_id: user1.id, group_id: group2.id }),
    ];

    await createTestGroupMembersInDB({ dbClient, values: groupMembers });

    const result = await searchGroupMembersData({
      dbClient,
      filters: { groupId: group1.id },
    });

    expect(result.records).toHaveLength(2);
    expect(result.total_records).toBe(2);
    expect(result.records.every(member => member.group_id === group1.id)).toBe(true);
  });

  testWithDbClient('should filter group members by userId', async ({ dbClient }) => {
    const user1 = makeFakeUser();
    const user2 = makeFakeUser();
    const group1 = makeFakeGroup({ owner_id: user1.id });
    const group2 = makeFakeGroup({ owner_id: user2.id });

    await createTestUsersInDB({ dbClient, values: [user1, user2] });
    await createTestGroupsInDB({ dbClient, values: [group1, group2] });

    const groupMembers = [
      makeFakeGroupMember({ user_id: user1.id, group_id: group1.id }),
      makeFakeGroupMember({ user_id: user2.id, group_id: group1.id }),
      makeFakeGroupMember({ user_id: user1.id, group_id: group2.id }),
    ];

    await createTestGroupMembersInDB({ dbClient, values: groupMembers });

    const result = await searchGroupMembersData({
      dbClient,
      filters: { userId: user1.id },
    });

    expect(result.records).toHaveLength(2);
    expect(result.total_records).toBe(2);
    expect(result.records.every(member => member.user_id === user1.id)).toBe(true);
  });

  testWithDbClient('should exclude archived group members by default', async ({ dbClient }) => {
    const user = makeFakeUser();
    const group = makeFakeGroup({ owner_id: user.id });

    await createTestUsersInDB({ dbClient, values: user });
    await createTestGroupsInDB({ dbClient, values: group });

    const activeGroupMember = makeFakeGroupMember({
      user_id: user.id,
      group_id: group.id,
    });

    const archivedGroupMember = makeFakeGroupMember({
      user_id: user.id,
      group_id: group.id,
      deleted_at: new Date(),
    });

    await createTestGroupMembersInDB({
      dbClient,
      values: [activeGroupMember, archivedGroupMember],
    });

    const result = await searchGroupMembersData({ dbClient });

    expect(result.records).toHaveLength(1);
    expect(result.total_records).toBe(1);
    expect(result.records[0]?.id).toEqual(activeGroupMember.id);
  });

  testWithDbClient(
    'should include archived group members when includeArchived is true',
    async ({ dbClient }) => {
      const user = makeFakeUser();
      const group = makeFakeGroup({ owner_id: user.id });

      await createTestUsersInDB({ dbClient, values: user });
      await createTestGroupsInDB({ dbClient, values: group });

      const activeGroupMember = makeFakeGroupMember({
        user_id: user.id,
        group_id: group.id,
      });

      const archivedGroupMember = makeFakeGroupMember({
        user_id: user.id,
        group_id: group.id,
        deleted_at: new Date(),
      });

      await createTestGroupMembersInDB({
        dbClient,
        values: [activeGroupMember, archivedGroupMember],
      });

      const result = await searchGroupMembersData({
        dbClient,
        includeArchived: true,
      });

      expect(result.records).toHaveLength(2);
      expect(result.total_records).toBe(2);
    }
  );
});
