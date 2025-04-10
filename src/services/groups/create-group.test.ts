import { makeFakeGroupMember } from '@/data/group-members/__test-utils__/make-fake-group-member';
import { makeFakeGroup } from '@/data/groups/__test-utils__/make-fake-group';
import { mockDbClient } from '@/db/__test-utils__/mock-db-client';
import { GroupMemberRole, GroupMemberStatus } from '@/db/types';
import { mockSession } from '@/middlewares/__test-utils__/openapi-hono';
import { BadRequestError } from '@/utils/errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createGroupService } from './create-group';

const mockDependencies = {
  getUserOwnedGroupsCountData: vi.fn(),
  createGroupData: vi.fn(),
  createGroupMemberData: vi.fn(),
};

const mockGroup = makeFakeGroup();

const mockOwnerMember = makeFakeGroupMember({
  group_id: mockGroup.id,
  user_id: mockSession.accountId,
  role: GroupMemberRole.OWNER,
});

const mockMember = makeFakeGroupMember({
  group_id: mockGroup.id,
  user_id: null,
  role: GroupMemberRole.MEMBER,
  status: GroupMemberStatus.PENDING,
  percentage_share: null,
  exact_share: null,
  placeholder_assignee_name: 'Test Member',
});

describe('createGroupService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully create a group with members', async () => {
    const payload = {
      session: mockSession,
      name: mockGroup.name,
      description: mockGroup.description,
      tag: mockGroup.tag,
      split_type: mockGroup.split_type,
      members: [{ placeholder_assignee_name: mockMember.placeholder_assignee_name }],
    };

    mockDependencies.getUserOwnedGroupsCountData.mockResolvedValue(0);
    mockDependencies.createGroupData.mockResolvedValue(mockGroup);
    mockDependencies.createGroupMemberData
      .mockResolvedValueOnce(mockOwnerMember)
      .mockResolvedValueOnce(mockMember);

    const result = await createGroupService({
      dbClient: mockDbClient.dbClientTransaction,
      payload,
      dependencies: mockDependencies,
    });

    expect(mockDependencies.getUserOwnedGroupsCountData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      userId: payload.session.accountId,
    });

    expect(mockDependencies.createGroupData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      values: {
        name: payload.name,
        description: payload.description,
        tag: payload.tag,
        split_type: payload.split_type,
        settlement_summary: null,
      },
    });

    expect(mockDependencies.createGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      values: {
        group_id: mockGroup.id,
        user_id: payload.session.accountId,
        role: GroupMemberRole.OWNER,
        status: GroupMemberStatus.APPROVED,
        percentage_share: null,
        exact_share: null,
        placeholder_assignee_name: null,
      },
    });

    expect(mockDependencies.createGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      values: {
        group_id: mockGroup.id,
        user_id: null,
        role: GroupMemberRole.MEMBER,
        status: GroupMemberStatus.PENDING,
        percentage_share: null,
        exact_share: null,
        placeholder_assignee_name: mockMember.placeholder_assignee_name,
      },
    });

    expect(result).toEqual({
      group: mockGroup,
      members: [mockOwnerMember, mockMember],
    });
  });

  it('should throw BadRequestError when user already has 5 owned groups', async () => {
    const payload = {
      session: mockSession,
      name: mockGroup.name,
      description: mockGroup.description,
      tag: mockGroup.tag,
      split_type: mockGroup.split_type,
      members: [{ placeholder_assignee_name: mockMember.placeholder_assignee_name }],
    };

    mockDependencies.getUserOwnedGroupsCountData.mockResolvedValue(5);

    await expect(
      createGroupService({
        dbClient: mockDbClient.dbClientTransaction,
        payload,
        dependencies: mockDependencies,
      })
    ).rejects.toThrow(new BadRequestError('You can only have up to 5 owned groups.'));

    expect(mockDependencies.getUserOwnedGroupsCountData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      userId: payload.session.accountId,
    });

    expect(mockDependencies.createGroupData).not.toHaveBeenCalled();
    expect(mockDependencies.createGroupMemberData).not.toHaveBeenCalled();
  });

  it('should throw BadRequestError when no members are provided', async () => {
    const payload = {
      session: mockSession,
      name: mockGroup.name,
      description: mockGroup.description,
      tag: mockGroup.tag,
      split_type: mockGroup.split_type,
      members: [],
    };

    mockDependencies.getUserOwnedGroupsCountData.mockResolvedValue(0);
    mockDependencies.createGroupData.mockResolvedValue(mockGroup);
    mockDependencies.createGroupMemberData.mockResolvedValueOnce(mockOwnerMember);

    await expect(
      createGroupService({
        dbClient: mockDbClient.dbClientTransaction,
        payload,
        dependencies: mockDependencies,
      })
    ).rejects.toThrow(new BadRequestError('You must invite at least one member to a group.'));

    expect(mockDependencies.getUserOwnedGroupsCountData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      userId: payload.session.accountId,
    });

    expect(mockDependencies.createGroupData).toHaveBeenCalled();
    expect(mockDependencies.createGroupMemberData).toHaveBeenCalledTimes(1);
  });
});
