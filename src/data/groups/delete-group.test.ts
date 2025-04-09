import { NotFoundError } from '@/utils/errors';
import { faker } from '@faker-js/faker';
import { describe, expect } from 'vitest';
import { testWithDbClient } from '../__test-utils__/test-with-db-client';
import { createTestGroupsInDB } from './__test-utils__/make-fake-group';
import { deleteGroupData } from './delete-group';

describe('Delete Group', () => {
  testWithDbClient('should delete a group', async ({ dbClient }) => {
    const [testCreatedGroup] = await createTestGroupsInDB({ dbClient });

    if (!testCreatedGroup) throw new Error('testCreatedGroup is undefined');

    const beforeGroups = await dbClient.selectFrom('groups').selectAll().execute();

    expect(beforeGroups.length).toBe(1);
    expect(beforeGroups[0]?.id).toBe(testCreatedGroup.id);

    const deletedGroup = await deleteGroupData({ dbClient, id: testCreatedGroup.id });
    const afterGroups = await dbClient.selectFrom('groups').selectAll().execute();

    expect(afterGroups.length).toBe(0);
    expect(deletedGroup?.id).toBe(testCreatedGroup.id);
  });

  testWithDbClient('should throw NotFoundError if group is not existing.', async ({ dbClient }) => {
    expect(() =>
      deleteGroupData({
        dbClient,
        id: faker.string.uuid(),
      })
    ).rejects.toThrow(new NotFoundError('Group not found.'));
  });
});
