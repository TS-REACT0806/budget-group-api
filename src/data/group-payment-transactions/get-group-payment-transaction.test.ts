import { type DbClient } from '@/db/create-db-client';
import { type Group, type GroupMember } from '@/db/schema';
import { NotFoundError } from '@/utils/errors';
import { describe, expect } from 'vitest';
import { testWithDbClient } from '../__test-utils__/test-with-db-client';
import {
  createTestGroupMembersInDB,
  makeFakeGroupMember,
} from '../group-members/__test-utils__/make-fake-group-member';
import { createTestGroupsInDB, makeFakeGroup } from '../groups/__test-utils__/make-fake-group';
import {
  createTestGroupPaymentTransactionsInDB,
  makeFakeGroupPaymentTransaction,
} from './__test-utils__/make-fake-group-payment-transaction';
import { getGroupPaymentTransactionData } from './get-group-payment-transaction';

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

describe('Get Group Payment Transaction', () => {
  testWithDbClient('should get a group payment transaction by id', async ({ dbClient }) => {
    const mockSenderMember = makeFakeGroupMember({ group_id: mockGroup.id });
    const mockReceiverMember = makeFakeGroupMember({ group_id: mockGroup.id });

    await setupTestData({
      dbClient,
      groups: [mockGroup],
      groupMembers: [mockSenderMember, mockReceiverMember],
    });

    const mockTransaction = makeFakeGroupPaymentTransaction({
      group_id: mockGroup.id,
      sender_member_id: mockSenderMember.id,
      receiver_member_id: mockReceiverMember.id,
    });

    await createTestGroupPaymentTransactionsInDB({
      dbClient,
      values: mockTransaction,
    });

    const result = await getGroupPaymentTransactionData({
      dbClient,
      id: mockTransaction.id,
    });

    expect(result).toEqual(mockTransaction);
  });

  testWithDbClient(
    'should throw NotFoundError if transaction does not exist',
    async ({ dbClient }) => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await expect(getGroupPaymentTransactionData({ dbClient, id: nonExistentId })).rejects.toThrow(
        NotFoundError
      );
    }
  );
});
