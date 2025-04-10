import { type DbClient } from '@/db/create-db-client';
import { type Group, type GroupMember } from '@/db/schema';
import { GroupPaymentTransactionStatus } from '@/db/types';
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
import { searchGroupPaymentTransactionsData } from './search-group-payment-transactions';

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

describe('Search Group Payment Transactions', () => {
  testWithDbClient('should search transactions by text', async ({ dbClient }) => {
    const mockGroup = makeFakeGroup();
    const mockSenderMember = makeFakeGroupMember({ group_id: mockGroup.id });
    const mockReceiverMember = makeFakeGroupMember({ group_id: mockGroup.id });

    await setupTestData({
      dbClient,
      groups: [mockGroup],
      groupMembers: [mockSenderMember, mockReceiverMember],
    });

    const searchDescription = 'Special payment';
    await createTestGroupPaymentTransactionsInDB({
      dbClient,
      values: [
        makeFakeGroupPaymentTransaction({
          description: searchDescription,
          group_id: mockGroup.id,
          sender_member_id: mockSenderMember.id,
          receiver_member_id: mockReceiverMember.id,
        }),
        makeFakeGroupPaymentTransaction({
          description: 'Another payment',
          group_id: mockGroup.id,
          sender_member_id: mockSenderMember.id,
          receiver_member_id: mockReceiverMember.id,
        }),
        makeFakeGroupPaymentTransaction({
          description: 'Regular payment',
          group_id: mockGroup.id,
          sender_member_id: mockSenderMember.id,
          receiver_member_id: mockReceiverMember.id,
        }),
      ],
    });

    const result = await searchGroupPaymentTransactionsData({
      dbClient,
      filters: { searchText: 'Special' },
    });

    expect(result.records.length).toBe(1);
    expect(result.records[0]?.description).toContain(searchDescription);
  });

  testWithDbClient('should search transactions by group ID', async ({ dbClient }) => {
    const mockGroup1 = makeFakeGroup();
    const mockGroup2 = makeFakeGroup();
    const mockSenderMember1 = makeFakeGroupMember({ group_id: mockGroup1.id });
    const mockReceiverMember1 = makeFakeGroupMember({ group_id: mockGroup1.id });
    const mockSenderMember2 = makeFakeGroupMember({ group_id: mockGroup2.id });
    const mockReceiverMember2 = makeFakeGroupMember({ group_id: mockGroup2.id });

    await setupTestData({
      dbClient,
      groups: [mockGroup1, mockGroup2],
      groupMembers: [
        mockSenderMember1,
        mockReceiverMember1,
        mockSenderMember2,
        mockReceiverMember2,
      ],
    });

    await createTestGroupPaymentTransactionsInDB({
      dbClient,
      values: [
        makeFakeGroupPaymentTransaction({
          group_id: mockGroup1.id,
          sender_member_id: mockSenderMember1.id,
          receiver_member_id: mockReceiverMember1.id,
        }),
        makeFakeGroupPaymentTransaction({
          group_id: mockGroup1.id,
          sender_member_id: mockSenderMember1.id,
          receiver_member_id: mockReceiverMember1.id,
        }),
        makeFakeGroupPaymentTransaction({
          group_id: mockGroup2.id,
          sender_member_id: mockSenderMember2.id,
          receiver_member_id: mockReceiverMember2.id,
        }),
      ],
    });

    const result = await searchGroupPaymentTransactionsData({
      dbClient,
      filters: { groupId: mockGroup1.id },
    });

    expect(result.records.length).toBe(2);
    expect(result.records.every(tx => tx.group_id === mockGroup1.id)).toBe(true);
  });

  testWithDbClient('should search transactions by status', async ({ dbClient }) => {
    const mockGroup = makeFakeGroup();
    const mockSenderMember = makeFakeGroupMember({ group_id: mockGroup.id });
    const mockReceiverMember = makeFakeGroupMember({ group_id: mockGroup.id });

    await setupTestData({
      dbClient,
      groups: [mockGroup],
      groupMembers: [mockSenderMember, mockReceiverMember],
    });

    await createTestGroupPaymentTransactionsInDB({
      dbClient,
      values: [
        makeFakeGroupPaymentTransaction({
          status: GroupPaymentTransactionStatus.PAID,
          group_id: mockGroup.id,
          sender_member_id: mockSenderMember.id,
          receiver_member_id: mockReceiverMember.id,
        }),
        makeFakeGroupPaymentTransaction({
          status: GroupPaymentTransactionStatus.PAID,
          group_id: mockGroup.id,
          sender_member_id: mockSenderMember.id,
          receiver_member_id: mockReceiverMember.id,
        }),
        makeFakeGroupPaymentTransaction({
          status: GroupPaymentTransactionStatus.REQUESTED,
          group_id: mockGroup.id,
          sender_member_id: mockSenderMember.id,
          receiver_member_id: mockReceiverMember.id,
        }),
      ],
    });

    const result = await searchGroupPaymentTransactionsData({
      dbClient,
      filters: { status: GroupPaymentTransactionStatus.PAID },
    });

    expect(result.records.length).toBe(2);
    expect(result.records.every(tx => tx.status === GroupPaymentTransactionStatus.PAID)).toBe(true);
  });

  testWithDbClient('should search transactions by sender member ID', async ({ dbClient }) => {
    const mockGroup = makeFakeGroup();
    const mockSenderMember1 = makeFakeGroupMember({ group_id: mockGroup.id });
    const mockSenderMember2 = makeFakeGroupMember({ group_id: mockGroup.id });
    const mockReceiverMember = makeFakeGroupMember({ group_id: mockGroup.id });

    await setupTestData({
      dbClient,
      groups: [mockGroup],
      groupMembers: [mockSenderMember1, mockSenderMember2, mockReceiverMember],
    });

    await createTestGroupPaymentTransactionsInDB({
      dbClient,
      values: [
        makeFakeGroupPaymentTransaction({
          sender_member_id: mockSenderMember1.id,
          receiver_member_id: mockReceiverMember.id,
          group_id: mockGroup.id,
        }),
        makeFakeGroupPaymentTransaction({
          sender_member_id: mockSenderMember1.id,
          receiver_member_id: mockReceiverMember.id,
          group_id: mockGroup.id,
        }),
        makeFakeGroupPaymentTransaction({
          sender_member_id: mockSenderMember2.id,
          receiver_member_id: mockReceiverMember.id,
          group_id: mockGroup.id,
        }),
      ],
    });

    const result = await searchGroupPaymentTransactionsData({
      dbClient,
      filters: { senderMemberId: mockSenderMember1.id },
    });

    expect(result.records.length).toBe(2);
    expect(result.records.every(tx => tx.sender_member_id === mockSenderMember1.id)).toBe(true);
  });

  testWithDbClient('should search transactions by receiver member ID', async ({ dbClient }) => {
    const mockGroup = makeFakeGroup();
    const mockSenderMember = makeFakeGroupMember({ group_id: mockGroup.id });
    const mockReceiverMember1 = makeFakeGroupMember({ group_id: mockGroup.id });
    const mockReceiverMember2 = makeFakeGroupMember({ group_id: mockGroup.id });

    await setupTestData({
      dbClient,
      groups: [mockGroup],
      groupMembers: [mockSenderMember, mockReceiverMember1, mockReceiverMember2],
    });

    await createTestGroupPaymentTransactionsInDB({
      dbClient,
      values: [
        makeFakeGroupPaymentTransaction({
          receiver_member_id: mockReceiverMember1.id,
          sender_member_id: mockSenderMember.id,
          group_id: mockGroup.id,
        }),
        makeFakeGroupPaymentTransaction({
          receiver_member_id: mockReceiverMember1.id,
          sender_member_id: mockSenderMember.id,
          group_id: mockGroup.id,
        }),
        makeFakeGroupPaymentTransaction({
          receiver_member_id: mockReceiverMember2.id,
          sender_member_id: mockSenderMember.id,
          group_id: mockGroup.id,
        }),
      ],
    });

    const result = await searchGroupPaymentTransactionsData({
      dbClient,
      filters: { receiverMemberId: mockReceiverMember1.id },
    });

    expect(result.records.length).toBe(2);
    expect(result.records.every(tx => tx.receiver_member_id === mockReceiverMember1.id)).toBe(true);
  });
});
