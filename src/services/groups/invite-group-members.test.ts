import { makeFakeGroupMember } from '@/data/group-members/__test-utils__/make-fake-group-member';
import { makeFakeGroup } from '@/data/groups/__test-utils__/make-fake-group';
import { mockDbClient } from '@/db/__test-utils__/mock-db-client';
import { GroupMemberRole, GroupMemberStatus } from '@/db/types';
import { mockSession } from '@/middlewares/__test-utils__/openapi-hono';
import { BadRequestError, ForbiddenError } from '@/utils/errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { inviteGroupMembersService } from './invite-group-members';

const mockDependencies = {
  getGroupMemberData: vi.fn(),
  createGroupMemberData: vi.fn(),
};

const mockGroup = makeFakeGroup();

const mockGroupMemberData = makeFakeGroupMember({
  group_id: mockGroup.id,
  user_id: mockSession.accountId,
  role: GroupMemberRole.OWNER,
});

const mockCreatedMember = makeFakeGroupMember({
  group_id: mockGroup.id,
  user_id: null,
  role: GroupMemberRole.MEMBER,
  status: GroupMemberStatus.PENDING,
  percentage_share: null,
  exact_share: null,
  placeholder_assignee_name: 'Test Member',
});

describe('inviteGroupMembersService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully invite members to a group as owner', async () => {
    const payload = {
      session: mockSession,
      groupId: mockGroup.id,
      members: [{ placeholder_assignee_name: mockCreatedMember.placeholder_assignee_name }],
    };

    mockDependencies.getGroupMemberData.mockResolvedValue(mockGroupMemberData);
    mockDependencies.createGroupMemberData.mockResolvedValue(mockCreatedMember);

    const result = await inviteGroupMembersService({
      dbClient: mockDbClient.dbClientTransaction,
      payload,
      dependencies: mockDependencies,
    });

    expect(mockDependencies.getGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      groupId: payload.groupId,
      userId: payload.session.accountId,
    });

    expect(mockDependencies.createGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      values: {
        group_id: payload.groupId,
        user_id: null,
        role: GroupMemberRole.MEMBER,
        status: GroupMemberStatus.PENDING,
        percentage_share: null,
        exact_share: null,
        placeholder_assignee_name: mockCreatedMember.placeholder_assignee_name,
      },
    });

    expect(result).toEqual([mockCreatedMember]);
  });

  it('should successfully invite members to a group as admin', async () => {
    const payload = {
      session: mockSession,
      groupId: mockGroup.id,
      members: [{ placeholder_assignee_name: mockCreatedMember.placeholder_assignee_name }],
    };

    mockDependencies.getGroupMemberData.mockResolvedValue({
      ...mockGroupMemberData,
      role: GroupMemberRole.ADMIN,
    });
    mockDependencies.createGroupMemberData.mockResolvedValue(mockCreatedMember);

    const result = await inviteGroupMembersService({
      dbClient: mockDbClient.dbClientTransaction,
      payload,
      dependencies: mockDependencies,
    });

    expect(mockDependencies.getGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      groupId: payload.groupId,
      userId: payload.session.accountId,
    });

    expect(mockDependencies.createGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      values: {
        group_id: payload.groupId,
        user_id: null,
        role: GroupMemberRole.MEMBER,
        status: GroupMemberStatus.PENDING,
        percentage_share: null,
        exact_share: null,
        placeholder_assignee_name: mockCreatedMember.placeholder_assignee_name,
      },
    });

    expect(result).toEqual([mockCreatedMember]);
  });

  it('should throw ForbiddenError when user is not an owner or admin', async () => {
    const payload = {
      session: mockSession,
      groupId: mockGroup.id,
      members: [{ placeholder_assignee_name: mockCreatedMember.placeholder_assignee_name }],
    };

    mockDependencies.getGroupMemberData.mockResolvedValue({
      ...mockGroupMemberData,
      role: GroupMemberRole.MEMBER,
    });

    await expect(
      inviteGroupMembersService({
        dbClient: mockDbClient.dbClientTransaction,
        payload,
        dependencies: mockDependencies,
      })
    ).rejects.toThrow(
      new ForbiddenError('You are not authorized to invite members to this group.')
    );

    expect(mockDependencies.getGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      groupId: payload.groupId,
      userId: payload.session.accountId,
    });

    expect(mockDependencies.createGroupMemberData).not.toHaveBeenCalled();
  });

  it('should throw BadRequestError when no members are provided', async () => {
    const payload = {
      session: mockSession,
      groupId: mockGroup.id,
      members: [],
    };

    mockDependencies.getGroupMemberData.mockResolvedValue(mockGroupMemberData);

    await expect(
      inviteGroupMembersService({
        dbClient: mockDbClient.dbClientTransaction,
        payload,
        dependencies: mockDependencies,
      })
    ).rejects.toThrow(new BadRequestError('You must invite at least one member to a group.'));

    expect(mockDependencies.getGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      groupId: payload.groupId,
      userId: payload.session.accountId,
    });

    expect(mockDependencies.createGroupMemberData).not.toHaveBeenCalled();
  });
});
