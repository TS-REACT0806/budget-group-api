import { getGroupMemberData } from '@/data/group-members/get-group-member';
import { deleteGroupData } from '@/data/groups/delete-group';
import { type DbClient } from '@/db/create-db-client';
import { GroupMemberRole } from '@/db/types';
import { type Session } from '@/types/auth';
import { ForbiddenError } from '@/utils/errors';

export type DeleteGroupServiceDependencies = {
  getGroupMemberData: typeof getGroupMemberData;
  deleteGroupData: typeof deleteGroupData;
};

export type DeleteGroupServiceArgs = {
  dbClient: DbClient;
  payload: {
    session: Session;
    groupId: string;
  };
  dependencies?: DeleteGroupServiceDependencies;
};

export async function deleteGroupService({
  dbClient,
  payload,
  dependencies = {
    getGroupMemberData,
    deleteGroupData,
  },
}: DeleteGroupServiceArgs) {
  const groupMemberData = await dependencies.getGroupMemberData({
    dbClient,
    groupId: payload.groupId,
    userId: payload.session.accountId,
  });

  if (groupMemberData.role !== GroupMemberRole.OWNER) {
    throw new ForbiddenError('You are not authorized to delete this group.');
  }

  const deletedGroup = await dependencies.deleteGroupData({
    dbClient,
    id: payload.groupId,
  });

  return deletedGroup;
}

export type DeleteGroupServiceResponse = Awaited<ReturnType<typeof deleteGroupService>>;
