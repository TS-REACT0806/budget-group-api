import { getGroupMemberData } from '@/data/group-members/get-group-member';
import { updateGroupData } from '@/data/groups/update-group';
import { type DbClient } from '@/db/create-db-client';
import { GroupMemberRole } from '@/db/types';
import { type Session } from '@/types/auth';
import { ForbiddenError } from '@/utils/errors';
import { sql } from 'kysely';

export type ArchiveGroupServiceDependencies = {
  getGroupMemberData: typeof getGroupMemberData;
  updateGroupData: typeof updateGroupData;
};

export type ArchiveGroupServiceArgs = {
  dbClient: DbClient;
  payload: {
    session: Session;
    groupId: string;
  };
  dependencies?: ArchiveGroupServiceDependencies;
};

export async function archiveGroupService({
  dbClient,
  payload,
  dependencies = {
    getGroupMemberData,
    updateGroupData,
  },
}: ArchiveGroupServiceArgs) {
  const groupMemberData = await dependencies.getGroupMemberData({
    dbClient,
    groupId: payload.groupId,
    userId: payload.session.accountId,
  });

  if (groupMemberData.role !== GroupMemberRole.OWNER) {
    throw new ForbiddenError('You are not authorized to update this group.');
  }

  const archivedGroup = await dependencies.updateGroupData({
    dbClient,
    id: payload.groupId,
    values: { deleted_at: sql`NOW()` as unknown as Date },
  });

  return archivedGroup;
}

export type ArchiveGroupServiceResponse = Awaited<ReturnType<typeof archiveGroupService>>;
