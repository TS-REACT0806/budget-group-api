import { NotFoundError } from '@/utils/errors';
import { faker } from '@faker-js/faker';
import { describe, expect } from 'vitest';
import { testWithDbClient } from '../__test-utils__/test-with-db-client';
import { createTestUsersInDB, makeFakeUser } from '../users/__test-utils__/make-fake-user';
import { createTestGroupsInDB } from './__test-utils__/make-fake-group';
import { getGroupData } from './get-group';

const fakeUser = makeFakeUser();

describe('Get Group', () => {
  testWithDbClient('should get a group', async ({ dbClient }) => {
    await createTestUsersInDB({ dbClient, values: fakeUser });
    const [testCreatedGroup] = await createTestGroupsInDB({
      dbClient,
      values: { owner_id: fakeUser.id },
    });

    if (!testCreatedGroup) throw new Error('testCreatedGroup is undefined');

    const group = await getGroupData({ dbClient, id: testCreatedGroup.id });

    expect(group?.id).toBe(testCreatedGroup.id);
  });

  testWithDbClient('should throw NotFoundError if user is not existing.', async ({ dbClient }) => {
    expect(() =>
      getGroupData({
        dbClient,
        id: faker.string.uuid(),
      })
    ).rejects.toThrow(new NotFoundError('Group not found.'));
  });
});
