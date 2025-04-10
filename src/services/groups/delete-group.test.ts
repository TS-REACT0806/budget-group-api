import { makeFakeGroupMember } from '@/data/group-members/__test-utils__/make-fake-group-member';
import { makeFakeGroup } from '@/data/groups/__test-utils__/make-fake-group';
import { mockDbClient } from '@/db/__test-utils__/mock-db-client';
import { GroupMemberRole } from '@/db/types';
import { mockSession } from '@/middlewares/__test-utils__/openapi-hono';
import { ForbiddenError } from '@/utils/errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteGroupService } from './delete-group';

const mockDependencies = {
  getGroupMemberData: vi.fn(),
  deleteGroupData: vi.fn(),
};

const mockGroup = makeFakeGroup();

const mockGroupMemberData = makeFakeGroupMember({
  group_id: mockGroup.id,
  user_id: mockSession.accountId,
  role: GroupMemberRole.OWNER,
});

const mockDeletedGroup = makeFakeGroup({
  id: mockGroup.id,
  deleted_at: new Date(),
});

describe('deleteGroupService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully delete a group', async () => {
    const payload = {
      session: mockSession,
      groupId: mockGroup.id,
    };

    mockDependencies.getGroupMemberData.mockResolvedValue(mockGroupMemberData);
    mockDependencies.deleteGroupData.mockResolvedValue(mockDeletedGroup);

    const result = await deleteGroupService({
      dbClient: mockDbClient.dbClient,
      payload,
      dependencies: mockDependencies,
    });

    expect(mockDependencies.getGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      groupId: payload.groupId,
      userId: payload.session.accountId,
    });

    expect(mockDependencies.deleteGroupData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      id: payload.groupId,
    });

    expect(result).toEqual(mockDeletedGroup);
  });

  it('should throw ForbiddenError when user is not the owner', async () => {
    const payload = {
      session: mockSession,
      groupId: mockGroup.id,
    };

    mockDependencies.getGroupMemberData.mockResolvedValue({
      ...mockGroupMemberData,
      role: GroupMemberRole.ADMIN,
    });

    await expect(
      deleteGroupService({
        dbClient: mockDbClient.dbClient,
        payload,
        dependencies: mockDependencies,
      })
    ).rejects.toThrow(new ForbiddenError('You are not authorized to delete this group.'));

    expect(mockDependencies.getGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      groupId: payload.groupId,
      userId: payload.session.accountId,
    });

    expect(mockDependencies.deleteGroupData).not.toHaveBeenCalled();
  });
});
