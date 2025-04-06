import { NotFoundError } from '@/utils/errors';
import { faker } from '@faker-js/faker';
import { describe, expect } from 'vitest';
import { testWithDbClient } from '../__test-utils__/test-with-db-client';
import { createTestUsersInDB, makeFakeUser } from '../users/__test-utils__/make-fake-user';
import { createTestGroupsInDB } from './__test-utils__/make-fake-group';
import { updateGroupData } from './update-group';

const fakeUser = makeFakeUser();

describe('Update Group', () => {
  testWithDbClient('should update a group', async ({ dbClient }) => {
    await createTestUsersInDB({ dbClient, values: fakeUser });
    const [testCreatedGroup] = await createTestGroupsInDB({
      dbClient,
      values: { owner_id: fakeUser.id },
    });

    if (!testCreatedGroup) throw new Error('testCreatedGroup is undefined');

    const beforeGroups = await dbClient.selectFrom('groups').selectAll().execute();

    expect(beforeGroups.length).toBe(1);
    expect(beforeGroups[0]?.id).toBe(testCreatedGroup.id);
    expect(beforeGroups[0]?.name).toBe(testCreatedGroup.name);
    expect(beforeGroups[0]?.updated_at.toISOString()).toBe(
      testCreatedGroup.updated_at.toISOString()
    );

    const updatedName = faker.person.firstName();
    const updatedGroup = await updateGroupData({
      dbClient,
      id: testCreatedGroup.id,
      values: { name: updatedName },
    });
    const afterGroups = await dbClient.selectFrom('groups').selectAll().execute();

    expect(afterGroups.length).toBe(1);
    expect(updatedGroup?.id).toBe(testCreatedGroup.id);
    expect(updatedGroup?.name).toBe(updatedName);
    expect(updatedGroup?.updated_at.toISOString()).not.equal(
      beforeGroups[0]?.updated_at.toISOString()
    );
  });

  testWithDbClient('should throw NotFoundError if group is not existing.', async ({ dbClient }) => {
    expect(() =>
      updateGroupData({
        dbClient,
        id: faker.string.uuid(),
        values: { name: faker.person.firstName() },
      })
    ).rejects.toThrow(new NotFoundError('Group not found.'));
  });
});
