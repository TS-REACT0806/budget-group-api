import { makeFakeGroupMember } from '@/data/group-members/__test-utils__/make-fake-group-member';
import { makeFakeGroup } from '@/data/groups/__test-utils__/make-fake-group';
import { mockDbClient } from '@/db/__test-utils__/mock-db-client';
import { GroupMemberRole, GroupMemberStatus } from '@/db/types';
import { mockSession } from '@/middlewares/__test-utils__/openapi-hono';
import { BadRequestError, ForbiddenError } from '@/utils/errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { updateGroupMembersService } from './update-group-members';

const mockDependencies = {
  getGroupMemberData: vi.fn(),
  updateGroupMemberData: vi.fn(),
};

const mockGroup = makeFakeGroup();

const mockGroupMemberData = makeFakeGroupMember({
  group_id: mockGroup.id,
  user_id: mockSession.accountId,
  role: GroupMemberRole.OWNER,
});

const mockUpdatedMember = makeFakeGroupMember({
  group_id: mockGroup.id,
  user_id: null,
  role: GroupMemberRole.ADMIN,
  status: GroupMemberStatus.APPROVED,
  percentage_share: null,
  exact_share: null,
  placeholder_assignee_name: 'Updated Member',
});

describe('updateGroupMembersService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully update group members as owner', async () => {
    const payload = {
      session: mockSession,
      groupId: mockGroup.id,
      members: [
        {
          id: mockUpdatedMember.id,
          placeholder_assignee_name: mockUpdatedMember.placeholder_assignee_name,
          role: GroupMemberRole.ADMIN,
          status: GroupMemberStatus.APPROVED,
        },
      ],
    };

    mockDependencies.getGroupMemberData.mockResolvedValue(mockGroupMemberData);
    mockDependencies.updateGroupMemberData.mockResolvedValue(mockUpdatedMember);

    const result = await updateGroupMembersService({
      dbClient: mockDbClient.dbClientTransaction,
      payload,
      dependencies: mockDependencies,
    });

    expect(mockDependencies.getGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      groupId: payload.groupId,
      userId: payload.session.accountId,
    });

    expect(mockDependencies.updateGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      id: mockUpdatedMember.id,
      groupId: payload.groupId,
      values: {
        placeholder_assignee_name: mockUpdatedMember.placeholder_assignee_name,
        role: GroupMemberRole.ADMIN,
        status: GroupMemberStatus.APPROVED,
      },
    });

    expect(result).toEqual([mockUpdatedMember]);
  });

  it('should successfully update group members as admin', async () => {
    const payload = {
      session: mockSession,
      groupId: mockGroup.id,
      members: [
        {
          id: mockUpdatedMember.id,
          placeholder_assignee_name: mockUpdatedMember.placeholder_assignee_name,
          role: GroupMemberRole.MEMBER,
          status: GroupMemberStatus.APPROVED,
        },
      ],
    };

    mockDependencies.getGroupMemberData.mockResolvedValue({
      ...mockGroupMemberData,
      role: GroupMemberRole.ADMIN,
    });
    mockDependencies.updateGroupMemberData.mockResolvedValue({
      ...mockUpdatedMember,
      role: GroupMemberRole.MEMBER,
    });

    const result = await updateGroupMembersService({
      dbClient: mockDbClient.dbClientTransaction,
      payload,
      dependencies: mockDependencies,
    });

    expect(mockDependencies.getGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      groupId: payload.groupId,
      userId: payload.session.accountId,
    });

    expect(mockDependencies.updateGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      id: mockUpdatedMember.id,
      groupId: payload.groupId,
      values: {
        placeholder_assignee_name: mockUpdatedMember.placeholder_assignee_name,
        role: GroupMemberRole.MEMBER,
        status: GroupMemberStatus.APPROVED,
      },
    });

    expect(result).toEqual([{ ...mockUpdatedMember, role: GroupMemberRole.MEMBER }]);
  });

  it('should throw ForbiddenError when user is not an owner or admin', async () => {
    const payload = {
      session: mockSession,
      groupId: mockGroup.id,
      members: [
        {
          id: mockUpdatedMember.id,
          placeholder_assignee_name: mockUpdatedMember.placeholder_assignee_name,
          role: GroupMemberRole.MEMBER,
        },
      ],
    };

    mockDependencies.getGroupMemberData.mockResolvedValue({
      ...mockGroupMemberData,
      role: GroupMemberRole.MEMBER,
    });

    await expect(
      updateGroupMembersService({
        dbClient: mockDbClient.dbClientTransaction,
        payload,
        dependencies: mockDependencies,
      })
    ).rejects.toThrow(
      new ForbiddenError('You are not authorized to update members in this group.')
    );

    expect(mockDependencies.getGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      groupId: payload.groupId,
      userId: payload.session.accountId,
    });

    expect(mockDependencies.updateGroupMemberData).not.toHaveBeenCalled();
  });

  it('should throw BadRequestError when no members are provided', async () => {
    const payload = {
      session: mockSession,
      groupId: mockGroup.id,
      members: [],
    };

    mockDependencies.getGroupMemberData.mockResolvedValue(mockGroupMemberData);

    await expect(
      updateGroupMembersService({
        dbClient: mockDbClient.dbClientTransaction,
        payload,
        dependencies: mockDependencies,
      })
    ).rejects.toThrow(new BadRequestError('You must update at least one member in a group.'));

    expect(mockDependencies.getGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      groupId: payload.groupId,
      userId: payload.session.accountId,
    });

    expect(mockDependencies.updateGroupMemberData).not.toHaveBeenCalled();
  });
});
