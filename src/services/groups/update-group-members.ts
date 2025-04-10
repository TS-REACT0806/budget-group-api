import { getGroupMemberData } from '@/data/group-members/get-group-member';
import { updateGroupMemberData } from '@/data/group-members/update-group-member';
import { type DbClient } from '@/db/create-db-client';
import { GroupMemberRole, type GroupMemberStatus } from '@/db/types';
import { type Session } from '@/types/auth';
import { BadRequestError, ForbiddenError } from '@/utils/errors';

export type UpdateGroupMembersServiceDependencies = {
  getGroupMemberData: typeof getGroupMemberData;
  updateGroupMemberData: typeof updateGroupMemberData;
};

export type UpdateGroupMembersServiceArgs = {
  dbClient: DbClient;
  payload: {
    session: Session;
    groupId: string;
    members: Array<{
      id: string;
      placeholder_assignee_name: string | null;
      status?: GroupMemberStatus;
      role?: GroupMemberRole;
      userId?: string;
    }>;
  };
  dependencies?: UpdateGroupMembersServiceDependencies;
};

export async function updateGroupMembersService({
  dbClient,
  payload,
  dependencies = {
    getGroupMemberData,
    updateGroupMemberData,
  },
}: UpdateGroupMembersServiceArgs) {
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
      throw new ForbiddenError('You are not authorized to update members in this group.');
    }

    if (payload.members.length === 0) {
      throw new BadRequestError('You must update at least one member in a group.');
    }

    const updateMemberPromises = payload.members.map(member => {
      return dependencies.updateGroupMemberData({
        dbClient: dbClientTrx,
        id: member.id,
        groupId: payload.groupId,
        values: {
          placeholder_assignee_name: member.placeholder_assignee_name,
          role: member.role,
          status: member.status,
          user_id: member.userId,
        },
      });
    });

    const updatedMembers = await Promise.all(updateMemberPromises);

    return updatedMembers;
  });
}

export type UpdateGroupMembersServiceResponse = Awaited<
  ReturnType<typeof updateGroupMembersService>
>;
