import { type DbClient } from '@/db/create-db-client';
import { type Group } from '@/db/schema';
import { GroupSplitType } from '@/db/types';
import { faker } from '@faker-js/faker';
import { type SettlementSummary } from '../schema/settlement-summary';

export function makeFakeSettlementSummary(
  override: Partial<SettlementSummary> = {}
): SettlementSummary {
  return {
    last_calculated_at: faker.date.recent(),
    total: {
      expenses: faker.finance.amount(),
      payments: faker.finance.amount(),
    },
    members: {},
    ...override,
  };
}

export function makeFakeGroup(override: Partial<Group> = {}): Group {
  return {
    id: faker.string.uuid(),
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    deleted_at: null,
    name: faker.lorem.word(),
    description: faker.lorem.sentence(),
    tag: faker.lorem.word(),
    split_type: GroupSplitType.EQUAL,
    settlement_summary: null,
    ...override,
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
