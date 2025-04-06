import { NotFoundError } from '@/utils/errors';
import { faker } from '@faker-js/faker';
import { describe, expect } from 'vitest';
import { testWithDbClient } from '../__test-utils__/test-with-db-client';
import { createTestGroupsInDB, makeFakeGroup } from '../groups/__test-utils__/make-fake-group';
import { createTestUsersInDB, makeFakeUser } from '../users/__test-utils__/make-fake-user';
import {
  createTestGroupMembersInDB,
  makeFakeGroupMember,
} from './__test-utils__/make-fake-group-member';
import { deleteGroupMemberData } from './delete-group-member';

const fakeUser = makeFakeUser();
const fakeGroup = makeFakeGroup({ owner_id: fakeUser.id });
const fakeGroupMember = makeFakeGroupMember({
  user_id: fakeUser.id,
  group_id: fakeGroup.id,
});

describe('Delete Group Member', () => {
  testWithDbClient('should delete a group member by ID', async ({ dbClient }) => {
    await createTestUsersInDB({ dbClient, values: fakeUser });
    await createTestGroupsInDB({ dbClient, values: fakeGroup });
    await createTestGroupMembersInDB({ dbClient, values: fakeGroupMember });

    const initialGroupMembers = await dbClient.selectFrom('group_members').selectAll().execute();
    expect(initialGroupMembers.length).toBe(1);

    const deletedGroupMember = await deleteGroupMemberData({ dbClient, id: fakeGroupMember.id });

    expect(deletedGroupMember).toBeDefined();
    expect(deletedGroupMember.id).toEqual(fakeGroupMember.id);

    const remainingGroupMembers = await dbClient.selectFrom('group_members').selectAll().execute();
    expect(remainingGroupMembers.length).toBe(0);
  });

  testWithDbClient('should throw NotFoundError for non-existent ID', async ({ dbClient }) => {
    await expect(deleteGroupMemberData({ dbClient, id: faker.string.uuid() })).rejects.toThrow(
      NotFoundError
    );
  });
});
