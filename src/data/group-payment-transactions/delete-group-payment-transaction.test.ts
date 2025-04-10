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
import { deleteGroupPaymentTransactionData } from './delete-group-payment-transaction';

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

describe('Delete Group Payment Transaction', () => {
  testWithDbClient('should delete a group payment transaction', async ({ dbClient }) => {
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

    const createdTransactions = await createTestGroupPaymentTransactionsInDB({
      dbClient,
      values: mockTransaction,
    });

    expect(createdTransactions.length).toBeGreaterThan(0);
    const createdTransaction = createdTransactions[0];

    if (!createdTransaction) {
      throw new Error('Failed to create test transaction');
    }

    const result = await deleteGroupPaymentTransactionData({
      dbClient,
      id: createdTransaction.id,
    });

    expect(result).toEqual(createdTransaction);

    // Verify deletion
    const existingTransactions = await dbClient
      .selectFrom('group_payment_transactions')
      .where('id', '=', createdTransaction.id)
      .selectAll()
      .execute();

    expect(existingTransactions.length).toBe(0);
  });

  testWithDbClient(
    'should throw NotFoundError if transaction does not exist',
    async ({ dbClient }) => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await expect(
        deleteGroupPaymentTransactionData({ dbClient, id: nonExistentId })
      ).rejects.toThrow(NotFoundError);
    }
  );
});
