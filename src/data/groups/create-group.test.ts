import { describe, expect } from 'vitest';
import { testWithDbClient } from '../__test-utils__/test-with-db-client';
import { makeFakeGroup } from './__test-utils__/make-fake-group';
import { createGroupData } from './create-group';

describe('Create Group', () => {
  testWithDbClient('should create a group', async ({ dbClient }) => {
    const fakeGroup = makeFakeGroup();

    const createdGroup = await createGroupData({ dbClient, values: fakeGroup });

    expect(createdGroup).toBeDefined();
    expect(createdGroup?.id).toBeDefined();
    expect(createdGroup?.name).toEqual(fakeGroup.name);
    expect(createdGroup?.split_type).toEqual(fakeGroup.split_type);
    expect(createdGroup?.created_at).toBeDefined();
    expect(createdGroup?.updated_at).toBeDefined();

    const currentGroups = await dbClient.selectFrom('groups').selectAll().execute();

    expect(currentGroups.length).toBe(1);
  });
});
