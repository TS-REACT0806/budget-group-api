import { type HonoEnv } from '@/types/hono';
import { OpenAPIHono } from '@hono/zod-openapi';
import { archiveGroupRoute, archiveGroupRouteHandler } from './archive-group';
import { createGroupRoute, createGroupRouteHandler } from './create-group';
import { deleteGroupRoute, deleteGroupRouteHandler } from './delete-group';
import { getGroupRoute, getGroupRouteHandler } from './get-group';
import { searchGroupsRoute, searchGroupsRouteHandler } from './search-groups';
import { updateGroupRoute, updateGroupRouteHandler } from './update-group';

const groupsRoutes = new OpenAPIHono<HonoEnv>()
  .openapi(searchGroupsRoute, searchGroupsRouteHandler)
  .openapi(createGroupRoute, createGroupRouteHandler)
  .openapi(getGroupRoute, getGroupRouteHandler)
  .openapi(updateGroupRoute, updateGroupRouteHandler)
  .openapi(deleteGroupRoute, deleteGroupRouteHandler)
  .openapi(archiveGroupRoute, archiveGroupRouteHandler);

export default groupsRoutes;
