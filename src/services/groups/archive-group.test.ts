import { makeFakeGroupMember } from '@/data/group-members/__test-utils__/make-fake-group-member';
import { makeFakeGroup } from '@/data/groups/__test-utils__/make-fake-group';
import { mockDbClient } from '@/db/__test-utils__/mock-db-client';
import { GroupMemberRole } from '@/db/types';
import { mockSession } from '@/middlewares/__test-utils__/openapi-hono';
import { ForbiddenError } from '@/utils/errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { archiveGroupService } from './archive-group';

const mockDependencies = {
  getGroupMemberData: vi.fn(),
  updateGroupData: vi.fn(),
};

const mockGroup = makeFakeGroup();

const mockGroupMemberData = makeFakeGroupMember({
  user_id: mockSession.accountId,
  role: GroupMemberRole.OWNER,
  group_id: mockGroup.id,
});

const mockArchivedGroup = makeFakeGroup({
  id: mockGroup.id,
  deleted_at: new Date(),
});

describe('archiveGroupService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully archive a group', async () => {
    const payload = {
      session: mockSession,
      groupId: mockGroup.id,
    };

    mockDependencies.getGroupMemberData.mockResolvedValue(mockGroupMemberData);
    mockDependencies.updateGroupData.mockResolvedValue(mockArchivedGroup);

    const result = await archiveGroupService({
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
      values: expect.objectContaining({ deleted_at: expect.any(Object) }),
    });

    expect(result).toEqual(mockArchivedGroup);
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
      archiveGroupService({
        dbClient: mockDbClient.dbClient,
        payload,
        dependencies: mockDependencies,
      })
    ).rejects.toThrow(ForbiddenError);

    expect(mockDependencies.getGroupMemberData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      groupId: payload.groupId,
      userId: payload.session.accountId,
    });

    expect(mockDependencies.updateGroupData).not.toHaveBeenCalled();
  });
});
