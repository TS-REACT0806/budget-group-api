import { NotFoundError } from '@/utils/errors';
import { faker } from '@faker-js/faker';
import { describe, expect } from 'vitest';
import { testWithDbClient } from '../__test-utils__/test-with-db-client';
import { createTestGroupsInDB } from './__test-utils__/make-fake-group';
import { getGroupData } from './get-group';

describe('Get Group', () => {
  testWithDbClient('should get a group', async ({ dbClient }) => {
    const [testCreatedGroup] = await createTestGroupsInDB({ dbClient });

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
