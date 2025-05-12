import { makeFakeGroupMember } from '@/data/group-members/__test-utils__/make-fake-group-member';
import { makeFakeGroup } from '@/data/groups/__test-utils__/make-fake-group';
import { mockDbClient } from '@/db/__test-utils__/mock-db-client';
import { GroupMemberRole, GroupSplitType } from '@/db/types';
import { mockSession } from '@/middlewares/__test-utils__/openapi-hono';
import { BadRequestError, ForbiddenError } from '@/utils/errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { updateGroupService } from './update-group';

const mockDependencies = {
  getGroupMemberData: vi.fn(),
  updateGroupData: vi.fn(),
  updateGroupMemberData: vi.fn(),
};

const mockGroup = makeFakeGroup({
  name: 'Original Group Name',
  description: 'Original Description',
  tag: 'original-tag',
  split_type: GroupSplitType.EQUAL,
});

const mockOwnerMember = makeFakeGroupMember({
  group_id: mockGroup.id,
  user_id: mockSession.accountId,
  role: GroupMemberRole.OWNER,
});

const mockMember = makeFakeGroupMember({
  id: 'member-id-1',
  group_id: mockGroup.id,
  user_id: 'user-id-1',
  role: GroupMemberRole.MEMBER,
  percentage_share: 50,
});

const mockUpdatedMember = {
  ...mockMember,
  percentage_share: 60,
};

describe('updateGroupService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully update a group and its members', async () => {
    const payload = {
      session: mockSession,
      groupId: mockGroup.id,
      name: 'Updated Group Name',
      description: 'Updated Description',
      tag: 'updated-tag',
      split_type: GroupSplitType.PERCENTAGE,
      members: [
        {
          id: mockMember.id,
          percentage_share: 60,
        },
      ],
    };

    mockDependencies.getGroupMemberData.mockResolvedValue(mockOwnerMember);
    mockDependencies.updateGroupData.mockResolvedValue({
      ...mockGroup,
      name: payload.name,
      description: payload.description,
      tag: payload.tag,
      split_type: payload.split_type,
    });
    mockDependencies.updateGroupMemberData.mockResolvedValue(mockUpdatedMember);

    const result = await updateGroupService({
      dbClient: mockDbClient.dbClientTransaction,
      payload,
      dependencies: mockDependencies,
    });

    expect(mockDependencies.getGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      groupId: payload.groupId,
      userId: payload.session.accountId,
    });

    expect(mockDependencies.updateGroupData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      id: payload.groupId,
      values: {
        name: payload.name,
        description: payload.description,
        tag: payload.tag,
        split_type: payload.split_type,
      },
    });

    expect(mockDependencies.updateGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      id: mockMember.id,
      groupId: payload.groupId,
      values: {
        placeholder_assignee_name: undefined,
        role: undefined,
        user_id: undefined,
        percentage_share: 60,
        exact_share: undefined,
      },
    });

    expect(result).toEqual({
      groupId: payload.groupId,
      updatedMembers: [mockUpdatedMember],
    });
  });

  it('should successfully update only group details without members', async () => {
    const payload = {
      session: mockSession,
      groupId: mockGroup.id,
      name: 'Updated Group Name',
      description: 'Updated Description',
    };

    mockDependencies.getGroupMemberData.mockResolvedValue(mockOwnerMember);
    mockDependencies.updateGroupData.mockResolvedValue({
      ...mockGroup,
      name: payload.name,
      description: payload.description,
    });

    const result = await updateGroupService({
      dbClient: mockDbClient.dbClientTransaction,
      payload,
      dependencies: mockDependencies,
    });

    expect(mockDependencies.getGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      groupId: payload.groupId,
      userId: payload.session.accountId,
    });

    expect(mockDependencies.updateGroupData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      id: payload.groupId,
      values: {
        name: payload.name,
        description: payload.description,
        tag: undefined,
        split_type: undefined,
      },
    });

    expect(mockDependencies.updateGroupMemberData).not.toHaveBeenCalled();

    expect(result).toEqual({
      groupId: payload.groupId,
      updatedMembers: [],
    });
  });

  it('should throw BadRequestError when members array is empty', async () => {
    const payload = {
      session: mockSession,
      groupId: mockGroup.id,
      members: [],
    };

    mockDependencies.getGroupMemberData.mockResolvedValue(mockOwnerMember);

    await expect(
      updateGroupService({
        dbClient: mockDbClient.dbClientTransaction,
        payload,
        dependencies: mockDependencies,
      })
    ).rejects.toThrow(new BadRequestError('You must update at least one member of a group.'));

    expect(mockDependencies.getGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      groupId: payload.groupId,
      userId: payload.session.accountId,
    });

    expect(mockDependencies.updateGroupData).not.toHaveBeenCalled();
    expect(mockDependencies.updateGroupMemberData).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenError when user is not authorized', async () => {
    const regularMember = {
      ...mockMember,
      user_id: mockSession.accountId,
      role: GroupMemberRole.MEMBER,
    };

    const payload = {
      session: mockSession,
      groupId: mockGroup.id,
      name: 'Updated Group Name',
    };

    mockDependencies.getGroupMemberData.mockResolvedValue(regularMember);

    await expect(
      updateGroupService({
        dbClient: mockDbClient.dbClientTransaction,
        payload,
        dependencies: mockDependencies,
      })
    ).rejects.toThrow(
      new ForbiddenError('You are not authorized to update members of this group.')
    );

    expect(mockDependencies.getGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      groupId: payload.groupId,
      userId: payload.session.accountId,
    });

    expect(mockDependencies.updateGroupData).not.toHaveBeenCalled();
    expect(mockDependencies.updateGroupMemberData).not.toHaveBeenCalled();
  });
});
