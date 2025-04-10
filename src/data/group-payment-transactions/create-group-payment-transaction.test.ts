import { type DbClient } from '@/db/create-db-client';
import { type Group, type GroupMember } from '@/db/schema';
import { describe, expect } from 'vitest';
import { testWithDbClient } from '../__test-utils__/test-with-db-client';
import {
  createTestGroupMembersInDB,
  makeFakeGroupMember,
} from '../group-members/__test-utils__/make-fake-group-member';
import { createTestGroupsInDB, makeFakeGroup } from '../groups/__test-utils__/make-fake-group';
import { makeFakeGroupPaymentTransaction } from './__test-utils__/make-fake-group-payment-transaction';
import { createGroupPaymentTransactionData } from './create-group-payment-transaction';

const setupTestData = async ({
  dbClient,
  groups,
  groupMembers,
}: {
  dbClient: DbClient;
  groups: Partial<Group>[];
  groupMembers: Partial<GroupMember>[];
}) => {
  await createTestGroupsInDB({ dbClient, values: groups });
  await createTestGroupMembersInDB({ dbClient, values: groupMembers });
};

const mockGroup = makeFakeGroup();

describe('Create Group Payment Transaction', () => {
  testWithDbClient('should create a group payment transaction', async ({ dbClient }) => {
    const mockSenderMember = makeFakeGroupMember({ group_id: mockGroup.id });
    const mockReceiverMember = makeFakeGroupMember({ group_id: mockGroup.id });

    await setupTestData({
      dbClient,
      groups: [mockGroup],
      groupMembers: [mockSenderMember, mockReceiverMember],
    });

    const mockGroupPaymentTransaction = makeFakeGroupPaymentTransaction({
      sender_member_id: mockSenderMember.id,
      receiver_member_id: mockReceiverMember.id,
      group_id: mockGroup.id,
    });

    const result = await createGroupPaymentTransactionData({
      dbClient,
      values: mockGroupPaymentTransaction,
    });

    expect(result.id).toBe(mockGroupPaymentTransaction.id);
    expect(result.created_at).toBeDefined();
    expect(result.updated_at).toBeDefined();
    expect(result.deleted_at).toBeNull();
    expect(result.sender_member_id).toBe(mockSenderMember.id);
    expect(result.receiver_member_id).toBe(mockReceiverMember.id);
  });
});
