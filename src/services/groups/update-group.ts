import { getGroupMemberData } from '@/data/group-members/get-group-member';
import { updateGroupMemberData } from '@/data/group-members/update-group-member';
import { updateGroupData } from '@/data/groups/update-group';
import { type DbClient } from '@/db/create-db-client';
import { GroupMemberRole, type GroupSplitType } from '@/db/types';
import { type Session } from '@/types/auth';
import { BadRequestError, ForbiddenError } from '@/utils/errors';

export type UpdateGroupServiceDependencies = {
  getGroupMemberData: typeof getGroupMemberData;
  updateGroupData: typeof updateGroupData;
  updateGroupMemberData: typeof updateGroupMemberData;
};

export type UpdateGroupServiceArgs = {
  dbClient: DbClient;
  payload: {
    session: Session;
    groupId: string;
    name?: string;
    description?: string;
    tag?: string;
    split_type?: GroupSplitType;
    members?: Array<{
      id: string;
      percentage_share?: number;
      exact_share?: string;
    }>;
  };
  dependencies?: UpdateGroupServiceDependencies;
};

export async function updateGroupService({
  dbClient,
  payload,
  dependencies = {
    getGroupMemberData,
    updateGroupData,
    updateGroupMemberData,
  },
}: UpdateGroupServiceArgs) {
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
      throw new ForbiddenError('You are not authorized to update members of this group.');
    }

    if (payload.members && !payload.members.length === 0) {
      throw new BadRequestError('You must update at least one member of a group.');
    }

    const updateMemberPromises = payload.members.map(member => {
      return dependencies.updateGroupMemberData({
        dbClient: dbClientTrx,
        id: member.id,
        groupId: payload.groupId,
        values: {
          placeholder_assignee_name: member.placeholder_assignee_name,
          role: member.role,
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
