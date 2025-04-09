import { getGroupMemberData } from '@/data/group-members/get-group-member';
import { updateGroupData } from '@/data/groups/update-group';
import { type DbClient } from '@/db/create-db-client';
import { GroupMemberRole } from '@/db/types';
import { type Session } from '@/types/auth';
import { ForbiddenError } from '@/utils/errors';

export type UnarchiveGroupServiceDependencies = {
  getGroupMemberData: typeof getGroupMemberData;
  updateGroupData: typeof updateGroupData;
};

export type UnarchiveGroupServiceArgs = {
  dbClient: DbClient;
  payload: {
    session: Session;
    groupId: string;
  };
  dependencies?: UnarchiveGroupServiceDependencies;
};

export async function unarchiveGroupService({
  dbClient,
  payload,
  dependencies = {
    getGroupMemberData,
    updateGroupData,
  },
}: UnarchiveGroupServiceArgs) {
  const groupMemberData = await dependencies.getGroupMemberData({
    dbClient,
    groupId: payload.groupId,
    userId: payload.session.accountId,
  });

  if (groupMemberData.role !== GroupMemberRole.OWNER) {
    throw new ForbiddenError('You are not authorized to update this group.');
  }

  const unarchivedGroup = await dependencies.updateGroupData({
    dbClient,
    id: payload.groupId,
    values: { deleted_at: null },
  });

  return unarchivedGroup;
}

export type UnarchiveGroupServiceResponse = Awaited<ReturnType<typeof unarchiveGroupService>>;
