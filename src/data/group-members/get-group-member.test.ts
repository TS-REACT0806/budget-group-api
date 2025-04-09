import { NotFoundError } from '@/utils/errors';
import { faker } from '@faker-js/faker';
import { describe, expect } from 'vitest';
import { testWithDbClient } from '../__test-utils__/test-with-db-client';
import { createTestGroupsInDB, makeFakeGroup } from '../groups/__test-utils__/make-fake-group';
import {
  createTestGroupMembersInDB,
  makeFakeGroupMember,
} from './__test-utils__/make-fake-group-member';
import { getGroupMemberData } from './get-group-member';

const fakeGroup = makeFakeGroup();
const fakeGroupMember = makeFakeGroupMember({ group_id: fakeGroup.id });

describe('Get Group Member', () => {
  testWithDbClient('should get a group member by ID', async ({ dbClient }) => {
    await createTestGroupsInDB({ dbClient, values: fakeGroup });
    await createTestGroupMembersInDB({ dbClient, values: fakeGroupMember });

    const groupMember = await getGroupMemberData({ dbClient, id: fakeGroupMember.id });

    expect(groupMember).toBeDefined();
    expect(groupMember.id).toEqual(fakeGroupMember.id);
    expect(groupMember.group_id).toEqual(fakeGroupMember.group_id);
    expect(groupMember.user_id).toEqual(fakeGroupMember.user_id);
  });

  testWithDbClient(
    'should throw a NotFoundError if group member ID does not exist',
    async ({ dbClient }) => {
      await expect(getGroupMemberData({ dbClient, id: faker.string.uuid() })).rejects.toThrow(
        NotFoundError
      );
    }
  );
});
