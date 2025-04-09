import { deleteGroupMemberData } from '@/data/group-members/delete-group-member';
import { getGroupMemberData } from '@/data/group-members/get-group-member';
import { type DbClient } from '@/db/create-db-client';
import { GroupMemberRole } from '@/db/types';
import { type Session } from '@/types/auth';
import { BadRequestError, ForbiddenError } from '@/utils/errors';

export type RemoveGroupMembersServiceDependencies = {
  getGroupMemberData: typeof getGroupMemberData;
  deleteGroupMemberData: typeof deleteGroupMemberData;
};

export type RemoveGroupMembersServiceArgs = {
  dbClient: DbClient;
  payload: {
    session: Session;
    groupId: string;
    memberIds: Array<string>;
  };
  dependencies?: RemoveGroupMembersServiceDependencies;
};

export async function removeGroupMembersService({
  dbClient,
  payload,
  dependencies = {
    getGroupMemberData,
    deleteGroupMemberData,
  },
}: RemoveGroupMembersServiceArgs) {
  return await dbClient.transaction().execute(async dbClientTrx => {
    const groupMemberData = await dependencies.getGroupMemberData({
      dbClient: dbClientTrx,
      groupId: payload.groupId,
      userId: payload.session.accountId,
    });

    if (
      groupMemberData.role !== GroupMemberRole.OWNER &&
      groupMemberData.role !== GroupMemberRole.ADMIN
    ) {
      throw new ForbiddenError('You are not authorized to remove members from this group.');
    }

    if (payload.memberIds.length === 0) {
      throw new BadRequestError('You must remove at least one member from a group.');
    }

    const deleteMemberPromises = payload.memberIds.map(memberId => {
      return dependencies.deleteGroupMemberData({
        dbClient: dbClientTrx,
        id: memberId,
      });
    });

    const deletedMembers = await Promise.all(deleteMemberPromises);

    return deletedMembers;
  });
}

export type RemoveGroupMembersServiceResponse = Awaited<
  ReturnType<typeof removeGroupMembersService>
>;
