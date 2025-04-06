import { groupSchemaOpenApi } from '@/data/groups/schema';
import { searchGroupsData } from '@/data/groups/search-groups';
import { authenticationMiddleware } from '@/middlewares/authentication';
import { type AppRouteHandler } from '@/types/hono';
import { createRoute, z } from '@hono/zod-openapi';

export const getGroupsSchema = {
  response: z.array(groupSchemaOpenApi),
};

export type GetGroupsResponse = z.infer<typeof getGroupsSchema.response>;

export const getGroupsRoute = createRoute({
  middleware: [authenticationMiddleware],
  security: [{ bearerAuth: [] }],
  method: 'get',
  path: '/groups',
  tags: ['Groups'],
  summary: 'List all groups',
  description: 'Returns a list of all groups.',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: getGroupsSchema.response,
        },
      },
      description: 'Groups retrieved successfully',
    },
  },
});

export const getGroupsRouteHandler: AppRouteHandler<typeof getGroupsRoute> = async c => {
  const dbClient = c.get('dbClient');

  const { records: groups } = await searchGroupsData({
    dbClient,
    limit: 100,
    page: 1,
  });

  return c.json(groups, { status: 200 });
};
