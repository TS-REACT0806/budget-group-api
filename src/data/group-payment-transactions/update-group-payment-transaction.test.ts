import { type DbClient } from '@/db/create-db-client';
import { type Group, type GroupMember } from '@/db/schema';
import { GroupPaymentTransactionStatus } from '@/db/types';
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
import { updateGroupPaymentTransactionData } from './update-group-payment-transaction';

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

describe('Update Group Payment Transaction', () => {
  testWithDbClient('should update a group payment transaction', async ({ dbClient }) => {
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

    const updateValues = {
      amount: '200.00',
      description: 'Updated payment description',
      status: GroupPaymentTransactionStatus.PAID,
    };

    const result = await updateGroupPaymentTransactionData({
      dbClient,
      id: mockTransaction.id,
      values: updateValues,
    });

    expect(result).toMatchObject({
      id: mockTransaction.id,
      ...updateValues,
    });
    expect(result.updated_at).not.toEqual(mockTransaction.updated_at);
  });

  testWithDbClient(
    'should throw NotFoundError if transaction does not exist',
    async ({ dbClient }) => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const updateValues = {
        amount: '200.00',
      };

      await expect(
        updateGroupPaymentTransactionData({
          dbClient,
          id: nonExistentId,
          values: updateValues,
        })
      ).rejects.toThrow(NotFoundError);
    }
  );
});
