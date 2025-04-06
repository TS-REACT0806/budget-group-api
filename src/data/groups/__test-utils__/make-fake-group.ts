import { type DbClient } from '@/db/create-db-client';
import { type Group } from '@/db/schema';
import { SplitType } from '@/db/types';
import { overrideValueOrUseDefault } from '@/utils/guard';
import { faker } from '@faker-js/faker';

export function makeFakeGroup(args?: Partial<Group>) {
  return {
    id: overrideValueOrUseDefault(args?.id, faker.string.uuid()),
    created_at: overrideValueOrUseDefault(args?.created_at, faker.date.recent()),
    updated_at: overrideValueOrUseDefault(args?.updated_at, faker.date.recent()),
    deleted_at: overrideValueOrUseDefault(args?.deleted_at, null),
    name: overrideValueOrUseDefault(args?.name, faker.lorem.word()),
    description: overrideValueOrUseDefault(args?.description, faker.lorem.sentence()),
    split_type: overrideValueOrUseDefault(args?.split_type, SplitType.EQUAL),
    owner_id: overrideValueOrUseDefault(args?.owner_id, faker.string.uuid()),
  } satisfies Group;
}

export type CreateTestGroupsInDBArgs = {
  dbClient: DbClient;
  values?: Partial<Group> | Partial<Group>[];
};

export async function createTestGroupsInDB({ dbClient, values }: CreateTestGroupsInDBArgs) {
  const fakeGroups = values instanceof Array ? values.map(makeFakeGroup) : makeFakeGroup(values);
  const createdGroups = await dbClient
    .insertInto('groups')
    .values(fakeGroups)
    .returningAll()
    .execute();
  return createdGroups;
}
