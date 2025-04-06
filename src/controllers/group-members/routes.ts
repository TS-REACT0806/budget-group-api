import { type HonoEnv } from '@/types/hono';
import { OpenAPIHono } from '@hono/zod-openapi';
import { archiveGroupMemberRoute, archiveGroupMemberRouteHandler } from './archive-group-member';
import { createGroupMemberRoute, createGroupMemberRouteHandler } from './create-group-member';
import { deleteGroupMemberRoute, deleteGroupMemberRouteHandler } from './delete-group-member';
import { getGroupMemberRoute, getGroupMemberRouteHandler } from './get-group-member';
import { searchGroupMembersRoute, searchGroupMembersRouteHandler } from './search-group-members';
import { updateGroupMemberRoute, updateGroupMemberRouteHandler } from './update-group-member';

const groupMembersRoutes = new OpenAPIHono<HonoEnv>()
  .openapi(searchGroupMembersRoute, searchGroupMembersRouteHandler)
  .openapi(createGroupMemberRoute, createGroupMemberRouteHandler)
  .openapi(getGroupMemberRoute, getGroupMemberRouteHandler)
  .openapi(updateGroupMemberRoute, updateGroupMemberRouteHandler)
  .openapi(deleteGroupMemberRoute, deleteGroupMemberRouteHandler)
  .openapi(archiveGroupMemberRoute, archiveGroupMemberRouteHandler);

export default groupMembersRoutes;
