import { getGroupData } from '@/data/groups/get-group';
import { groupSchemaOpenApi } from '@/data/groups/schema';
import { authenticationMiddleware } from '@/middlewares/authentication';
import { type AppRouteHandler } from '@/types/hono';
import { createRoute, z } from '@hono/zod-openapi';

export const getGroupSchema = {
  params: z.object({
    group_id: z
      .string()
      .uuid()
      .openapi({ param: { name: 'group_id', in: 'path' }, example: crypto.randomUUID() }),
  }),
  response: groupSchemaOpenApi,
};

export type GetGroupParams = z.infer<typeof getGroupSchema.params>;
export type GetGroupResponse = z.infer<typeof getGroupSchema.response>;

export const getGroupRoute = createRoute({
  middleware: [authenticationMiddleware],
  security: [{ bearerAuth: [] }],
  method: 'get',
  path: '/groups/{group_id}',
  tags: ['Groups'],
  summary: 'Retrieve a group',
  description: 'Retrieve the details of a group.',
  request: {
    params: getGroupSchema.params,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: getGroupSchema.response,
        },
      },
      description: 'Group retrieved successfully',
    },
  },
});

export const getGroupRouteHandler: AppRouteHandler<typeof getGroupRoute> = async c => {
  const dbClient = c.get('dbClient');
  const param = c.req.valid('param');

  const group = await getGroupData({ dbClient, id: param.group_id });

  return c.json(group, { status: 200 });
};
