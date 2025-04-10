import { makeFakeGroupMember } from '@/data/group-members/__test-utils__/make-fake-group-member';
import { makeFakeGroup } from '@/data/groups/__test-utils__/make-fake-group';
import { mockDbClient } from '@/db/__test-utils__/mock-db-client';
import { GroupMemberRole } from '@/db/types';
import { mockSession } from '@/middlewares/__test-utils__/openapi-hono';
import { ForbiddenError } from '@/utils/errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { unarchiveGroupService } from './unarchive-group';

const mockDependencies = {
  getGroupMemberData: vi.fn(),
  updateGroupData: vi.fn(),
};

const mockGroup = makeFakeGroup();

const mockGroupMemberData = makeFakeGroupMember({
  group_id: mockGroup.id,
  user_id: mockSession.accountId,
  role: GroupMemberRole.OWNER,
});

const mockUnarchivedGroup = makeFakeGroup({
  id: mockGroup.id,
  deleted_at: null,
});

describe('unarchiveGroupService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully unarchive a group', async () => {
    const payload = {
      session: mockSession,
      groupId: mockGroup.id,
    };

    mockDependencies.getGroupMemberData.mockResolvedValue(mockGroupMemberData);
    mockDependencies.updateGroupData.mockResolvedValue(mockUnarchivedGroup);

    const result = await unarchiveGroupService({
      dbClient: mockDbClient.dbClient,
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
      values: { deleted_at: null },
    });

    expect(result).toEqual(mockUnarchivedGroup);
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
      unarchiveGroupService({
        dbClient: mockDbClient.dbClient,
        payload,
        dependencies: mockDependencies,
      })
    ).rejects.toThrow(new ForbiddenError('You are not authorized to update this group.'));

    expect(mockDependencies.getGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      groupId: payload.groupId,
      userId: payload.session.accountId,
    });

    expect(mockDependencies.updateGroupData).not.toHaveBeenCalled();
  });
});
