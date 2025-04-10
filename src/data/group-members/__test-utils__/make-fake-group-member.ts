import { type DbClient } from '@/db/create-db-client';
import { type GroupMember } from '@/db/schema';
import { GroupMemberRole, GroupMemberStatus } from '@/db/types';
import { faker } from '@faker-js/faker';

export function makeFakeGroupMember(override: Partial<GroupMember> = {}): GroupMember {
  return {
    id: faker.string.uuid(),
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    deleted_at: null,
    percentage_share: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
    exact_share: null,
    status: GroupMemberStatus.PENDING,
    role: GroupMemberRole.MEMBER,
    placeholder_assignee_name: null,
    group_id: faker.string.uuid(),
    user_id: null,
    ...override,
  };
}

export async function createTestGroupMembersInDB({
  dbClient,
  values,
}: {
  dbClient: DbClient;
  values: Partial<GroupMember> | Partial<GroupMember>[];
}) {
  const fakeGroupMembers = Array.isArray(values)
    ? values.map(makeFakeGroupMember)
    : makeFakeGroupMember(values);

  const createdGroupMembers = await dbClient
    .insertInto('group_members')
    .values(fakeGroupMembers)
    .returningAll()
    .execute();

  return createdGroupMembers;
}
