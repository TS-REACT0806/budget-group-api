import { createGroupMemberData } from '@/data/group-members/create-group-member';
import { getGroupMemberData } from '@/data/group-members/get-group-member';
import { type DbClient } from '@/db/create-db-client';
import { GroupMemberRole, GroupMemberStatus } from '@/db/types';
import { type Session } from '@/types/auth';
import { BadRequestError, ForbiddenError } from '@/utils/errors';

export type InviteGroupMembersServiceDependencies = {
  getGroupMemberData: typeof getGroupMemberData;
  createGroupMemberData: typeof createGroupMemberData;
};

export type InviteGroupMembersServiceArgs = {
  dbClient: DbClient;
  payload: {
    session: Session;
    groupId: string;
    members: Array<{
      placeholder_assignee_name: string | null;
      role?: GroupMemberRole;
      userId?: string;
    }>;
  };
  dependencies?: InviteGroupMembersServiceDependencies;
};

export async function inviteGroupMembersService({
  dbClient,
  payload,
  dependencies = {
    getGroupMemberData,
    createGroupMemberData,
  },
}: InviteGroupMembersServiceArgs) {
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
      throw new ForbiddenError('You are not authorized to invite members to this group.');
    }

    if (payload.members.length === 0) {
      throw new BadRequestError('You must invite at least one member to a group.');
    }

    const createMemberPromises = payload.members.map(member => {
      return dependencies.createGroupMemberData({
        dbClient: dbClientTrx,
        values: {
          group_id: payload.groupId,
          placeholder_assignee_name: member.placeholder_assignee_name ?? null,
          role: member.userId ? (member.role ?? GroupMemberRole.MEMBER) : GroupMemberRole.MEMBER,
          status: GroupMemberStatus.PENDING,
          percentage_share: null,
          exact_share: null,
          user_id: member.userId ?? null,
        },
      });
    });

    const createdMembers = await Promise.all(createMemberPromises);

    return createdMembers;
  });
}

export type InviteGroupMembersServiceResponse = Awaited<
  ReturnType<typeof inviteGroupMembersService>
>;
