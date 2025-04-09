import { GroupMemberRole } from '@/db/types';
import { describe, expect } from 'vitest';
import { testWithDbClient } from '../__test-utils__/test-with-db-client';
import {
  createTestGroupMembersInDB,
  makeFakeGroupMember,
} from '../group-members/__test-utils__/make-fake-group-member';
import { createTestUsersInDB, makeFakeUser } from '../users/__test-utils__/make-fake-user';
import { createTestGroupsInDB, makeFakeGroup } from './__test-utils__/make-fake-group';
import { getUserOwnedGroupsCountData } from './get-user-owned-groups-count';

describe('Get User Owned Groups Count', () => {
  testWithDbClient('should get count of owned groups for a user', async ({ dbClient }) => {
    const fakeUser = makeFakeUser();
    const fakeGroup1 = makeFakeGroup();
    const fakeGroup2 = makeFakeGroup();

    await createTestUsersInDB({ dbClient, values: [fakeUser] });
    await createTestGroupsInDB({
      dbClient,
      values: [fakeGroup1, fakeGroup2],
    });

    // Create group memberships - user is owner of both groups
    await createTestGroupMembersInDB({
      dbClient,
      values: [
        makeFakeGroupMember({
          user_id: fakeUser.id,
          group_id: fakeGroup1.id,
          role: GroupMemberRole.OWNER,
        }),
        makeFakeGroupMember({
          user_id: fakeUser.id,
          group_id: fakeGroup2.id,
          role: GroupMemberRole.OWNER,
        }),
      ],
    });

    const count = await getUserOwnedGroupsCountData({ dbClient, userId: fakeUser.id });

    expect(count).toBe(2);
  });

  testWithDbClient('should only count groups where user is OWNER', async ({ dbClient }) => {
    const fakeUser = makeFakeUser();
    const fakeGroup1 = makeFakeGroup();
    const fakeGroup2 = makeFakeGroup();

    await createTestUsersInDB({ dbClient, values: [fakeUser] });
    await createTestGroupsInDB({
      dbClient,
      values: [fakeGroup1, fakeGroup2],
    });

    // Create group memberships - user is owner of one group, member of another
    await createTestGroupMembersInDB({
      dbClient,
      values: [
        makeFakeGroupMember({
          user_id: fakeUser.id,
          group_id: fakeGroup1.id,
          role: GroupMemberRole.OWNER,
        }),
        makeFakeGroupMember({
          user_id: fakeUser.id,
          group_id: fakeGroup2.id,
          role: GroupMemberRole.MEMBER,
        }),
      ],
    });

    const count = await getUserOwnedGroupsCountData({ dbClient, userId: fakeUser.id });

    expect(count).toBe(1);
  });

  testWithDbClient('should return 0 when user owns no groups', async ({ dbClient }) => {
    const fakeUser = makeFakeUser();

    const count = await getUserOwnedGroupsCountData({ dbClient, userId: fakeUser.id });

    expect(count).toBe(0);
  });
});
