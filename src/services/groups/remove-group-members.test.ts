import { makeFakeGroupMember } from '@/data/group-members/__test-utils__/make-fake-group-member';
import { makeFakeGroup } from '@/data/groups/__test-utils__/make-fake-group';
import { mockDbClient } from '@/db/__test-utils__/mock-db-client';
import { GroupMemberRole } from '@/db/types';
import { mockSession } from '@/middlewares/__test-utils__/openapi-hono';
import { BadRequestError, ForbiddenError } from '@/utils/errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { removeGroupMembersService } from './remove-group-members';

const mockDependencies = {
  getGroupMemberData: vi.fn(),
  deleteGroupMemberData: vi.fn(),
};

const mockGroup = makeFakeGroup();

const mockGroupMemberData = makeFakeGroupMember({
  group_id: mockGroup.id,
  user_id: mockSession.accountId,
  role: GroupMemberRole.OWNER,
});

const mockDeletedMember = makeFakeGroupMember({
  group_id: mockGroup.id,
});

describe('removeGroupMembersService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully remove members from a group as owner', async () => {
    const payload = {
      session: mockSession,
      groupId: mockGroup.id,
      memberIds: [mockDeletedMember.id],
    };

    mockDependencies.getGroupMemberData.mockResolvedValue(mockGroupMemberData);
    mockDependencies.deleteGroupMemberData.mockResolvedValue(mockDeletedMember);

    const result = await removeGroupMembersService({
      dbClient: mockDbClient.dbClientTransaction,
      payload,
      dependencies: mockDependencies,
    });

    expect(mockDependencies.getGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      groupId: payload.groupId,
      userId: payload.session.accountId,
    });

    expect(mockDependencies.deleteGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      id: mockDeletedMember.id,
    });

    expect(result).toEqual([mockDeletedMember]);
  });

  it('should successfully remove members from a group as admin', async () => {
    const payload = {
      session: mockSession,
      groupId: mockGroup.id,
      memberIds: [mockDeletedMember.id],
    };

    mockDependencies.getGroupMemberData.mockResolvedValue({
      ...mockGroupMemberData,
      role: GroupMemberRole.ADMIN,
    });
    mockDependencies.deleteGroupMemberData.mockResolvedValue(mockDeletedMember);

    const result = await removeGroupMembersService({
      dbClient: mockDbClient.dbClientTransaction,
      payload,
      dependencies: mockDependencies,
    });

    expect(mockDependencies.getGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      groupId: payload.groupId,
      userId: payload.session.accountId,
    });

    expect(mockDependencies.deleteGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      id: mockDeletedMember.id,
    });

    expect(result).toEqual([mockDeletedMember]);
  });

  it('should throw ForbiddenError when user is not an owner or admin', async () => {
    const payload = {
      session: mockSession,
      groupId: mockGroup.id,
      memberIds: [mockDeletedMember.id],
    };

    mockDependencies.getGroupMemberData.mockResolvedValue({
      ...mockGroupMemberData,
      role: GroupMemberRole.MEMBER,
    });

    await expect(
      removeGroupMembersService({
        dbClient: mockDbClient.dbClientTransaction,
        payload,
        dependencies: mockDependencies,
      })
    ).rejects.toThrow(
      new ForbiddenError('You are not authorized to remove members from this group.')
    );

    expect(mockDependencies.getGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      groupId: payload.groupId,
      userId: payload.session.accountId,
    });

    expect(mockDependencies.deleteGroupMemberData).not.toHaveBeenCalled();
  });

  it('should throw BadRequestError when no member IDs are provided', async () => {
    const payload = {
      session: mockSession,
      groupId: mockGroup.id,
      memberIds: [],
    };

    mockDependencies.getGroupMemberData.mockResolvedValue(mockGroupMemberData);

    await expect(
      removeGroupMembersService({
        dbClient: mockDbClient.dbClientTransaction,
        payload,
        dependencies: mockDependencies,
      })
    ).rejects.toThrow(new BadRequestError('You must remove at least one member from a group.'));

    expect(mockDependencies.getGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      groupId: payload.groupId,
      userId: payload.session.accountId,
    });

    expect(mockDependencies.deleteGroupMemberData).not.toHaveBeenCalled();
  });
});
