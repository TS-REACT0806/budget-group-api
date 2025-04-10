import { type DbClient } from '@/db/create-db-client';
import { type Group, type GroupMember } from '@/db/schema';
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
import { getGroupPaymentTransactionsData } from './get-group-payment-transactions';

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

describe('Get Group Payment Transactions', () => {
  testWithDbClient('should get transactions with pagination', async ({ dbClient }) => {
    const mockSenderMember = makeFakeGroupMember({ group_id: mockGroup.id });
    const mockReceiverMember = makeFakeGroupMember({ group_id: mockGroup.id });

    await setupTestData({
      dbClient,
      groups: [mockGroup],
      groupMembers: [mockSenderMember, mockReceiverMember],
    });

    const mockTransactions = Array.from({ length: 10 }).map(() =>
      makeFakeGroupPaymentTransaction({
        group_id: mockGroup.id,
        sender_member_id: mockSenderMember.id,
        receiver_member_id: mockReceiverMember.id,
      })
    );

    await createTestGroupPaymentTransactionsInDB({
      dbClient,
      values: mockTransactions,
    });

    const result = await getGroupPaymentTransactionsData({ dbClient });

    expect(result.records.length).toBe(10);
    expect(result.total_records).toBe(10);
    expect(result.total_pages).toBe(1);
    expect(result.current_page).toBe(1);
    expect(result.next_page).toBeNull();
    expect(result.previous_page).toBeNull();
  });

  testWithDbClient('should respect limit and page parameters', async ({ dbClient }) => {
    const mockSenderMember = makeFakeGroupMember({ group_id: mockGroup.id });
    const mockReceiverMember = makeFakeGroupMember({ group_id: mockGroup.id });

    await setupTestData({
      dbClient,
      groups: [mockGroup],
      groupMembers: [mockSenderMember, mockReceiverMember],
    });

    const mockTransactions = Array.from({ length: 15 }).map(() =>
      makeFakeGroupPaymentTransaction({
        group_id: mockGroup.id,
        sender_member_id: mockSenderMember.id,
        receiver_member_id: mockReceiverMember.id,
      })
    );

    await createTestGroupPaymentTransactionsInDB({
      dbClient,
      values: mockTransactions,
    });

    const result = await getGroupPaymentTransactionsData({
      dbClient,
      limit: 5,
      page: 2,
    });

    expect(result.records.length).toBe(5);
    expect(result.total_records).toBe(15);
    expect(result.total_pages).toBe(3);
    expect(result.current_page).toBe(2);
    expect(result.next_page).toBe(3);
    expect(result.previous_page).toBe(1);
  });
});
