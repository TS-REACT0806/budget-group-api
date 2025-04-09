import { createGroupMemberData } from '@/data/group-members/create-group-member';
import { createGroupData } from '@/data/groups/create-group';
import { getUserOwnedGroupsCountData } from '@/data/groups/get-user-owned-groups-count';
import { type DbClient } from '@/db/create-db-client';
import { GroupMemberRole, GroupMemberStatus, GroupSplitType } from '@/db/types';
import { type Session } from '@/types/auth';
import { BadRequestError } from '@/utils/errors';

export type CreateGroupServiceDependencies = {
  getUserOwnedGroupsCountData: typeof getUserOwnedGroupsCountData;
  createGroupData: typeof createGroupData;
  createGroupMemberData: typeof createGroupMemberData;
};

export type CreateGroupServiceArgs = {
  dbClient: DbClient;
  payload: {
    session: Session;
    name: string;
    description?: string;
    tag?: string;
    split_type?: GroupSplitType;
    members?: Array<{
      placeholder_assignee_name: string | null;
      role?: GroupMemberRole;
      userId?: string;
    }>;
  };
  dependencies?: CreateGroupServiceDependencies;
};

export async function createGroupService({
  dbClient,
  payload,
  dependencies = {
    getUserOwnedGroupsCountData,
    createGroupData,
    createGroupMemberData,
  },
}: CreateGroupServiceArgs) {
  return await dbClient.transaction().execute(async dbClientTrx => {
    const userOwnedGroupsCount = await dependencies.getUserOwnedGroupsCountData({
      dbClient: dbClientTrx,
      userId: payload.session.accountId,
    });

    if (userOwnedGroupsCount >= 5) {
      throw new BadRequestError('You can only have up to 5 owned groups.');
    }

    const createdGroup = await dependencies.createGroupData({
      dbClient: dbClientTrx,
      values: {
        name: payload.name,
        description: payload.description ?? null,
        tag: payload.tag ?? null,
        split_type: payload.split_type ?? GroupSplitType.EQUAL,
        settlement_summary: null,
      },
    });

    const createdOwnerMember = await dependencies.createGroupMemberData({
      dbClient: dbClientTrx,
      values: {
        group_id: createdGroup.id,
        user_id: payload.session.accountId,
        role: GroupMemberRole.OWNER,
        status: GroupMemberStatus.APPROVED,
        percentage_share: null,
        exact_share: null,
        placeholder_assignee_name: null,
      },
    });

    if (!payload.members || payload.members.length === 0) {
      throw new BadRequestError('You must invite at least one member to a group.');
    }

    const createMemberPromises = payload.members.map(member => {
      return dependencies.createGroupMemberData({
        dbClient: dbClientTrx,
        values: {
          group_id: createdGroup.id,
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

    return {
      group: createdGroup,
      members: [createdOwnerMember, ...createdMembers],
    };
  });
}

export type CreateGroupServiceResponse = Awaited<ReturnType<typeof createGroupService>>;
