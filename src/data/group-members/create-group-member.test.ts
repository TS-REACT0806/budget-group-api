import { describe, expect } from 'vitest';
import { testWithDbClient } from '../__test-utils__/test-with-db-client';
import { createTestGroupsInDB, makeFakeGroup } from '../groups/__test-utils__/make-fake-group';
import { makeFakeGroupMember } from './__test-utils__/make-fake-group-member';
import { createGroupMemberData } from './create-group-member';

const fakeGroup = makeFakeGroup();

describe('Create Group Member', () => {
  testWithDbClient('should create a group member', async ({ dbClient }) => {
    const fakeGroupMember = makeFakeGroupMember({
      group_id: fakeGroup.id,
    });

    await createTestGroupsInDB({ dbClient, values: fakeGroup });

    const createdGroupMember = await createGroupMemberData({ dbClient, values: fakeGroupMember });

    expect(createdGroupMember).toBeDefined();
    expect(createdGroupMember?.id).toBeDefined();
    expect(createdGroupMember?.group_id).toEqual(fakeGroupMember.group_id);
    expect(createdGroupMember?.user_id).toEqual(fakeGroupMember.user_id);
    expect(createdGroupMember?.percentage_share).toEqual(fakeGroupMember.percentage_share);
    expect(createdGroupMember?.created_at).toBeDefined();
    expect(createdGroupMember?.updated_at).toBeDefined();

    const currentGroupMembers = await dbClient.selectFrom('group_members').selectAll().execute();

    expect(currentGroupMembers.length).toBe(1);
  });
});
