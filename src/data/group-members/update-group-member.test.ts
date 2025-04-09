import { NotFoundError } from '@/utils/errors';
import { faker } from '@faker-js/faker';
import { describe, expect } from 'vitest';
import { testWithDbClient } from '../__test-utils__/test-with-db-client';
import { createTestGroupsInDB, makeFakeGroup } from '../groups/__test-utils__/make-fake-group';
import {
  createTestGroupMembersInDB,
  makeFakeGroupMember,
} from './__test-utils__/make-fake-group-member';
import { updateGroupMemberData } from './update-group-member';

const fakeGroup = makeFakeGroup();
const fakeGroupMember = makeFakeGroupMember({
  group_id: fakeGroup.id,
  percentage_share: 25,
  exact_share: null,
});

describe('Update Group Member', () => {
  testWithDbClient('should update a group member', async ({ dbClient }) => {
    await createTestGroupsInDB({ dbClient, values: fakeGroup });
    await createTestGroupMembersInDB({ dbClient, values: fakeGroupMember });

    const updatedValues = {
      percentage_share: 50,
    };

    const updatedRecord = await updateGroupMemberData({
      dbClient,
      id: fakeGroupMember.id,
      values: updatedValues,
    });

    expect(updatedRecord).toBeDefined();
    expect(updatedRecord.id).toEqual(fakeGroupMember.id);
    expect(updatedRecord.percentage_share).toEqual(updatedValues.percentage_share);
    expect(updatedRecord.updated_at).not.toEqual(fakeGroupMember.updated_at);

    const currentGroupMember = await dbClient
      .selectFrom('group_members')
      .selectAll()
      .where('id', '=', fakeGroupMember.id)
      .executeTakeFirst();

    expect(currentGroupMember?.percentage_share).toEqual(updatedValues.percentage_share);
  });

  testWithDbClient('should throw NotFoundError for non-existent ID', async ({ dbClient }) => {
    await expect(
      updateGroupMemberData({
        dbClient,
        id: faker.string.uuid(),
        values: { percentage_share: 50 },
      })
    ).rejects.toThrow(NotFoundError);
  });
});
