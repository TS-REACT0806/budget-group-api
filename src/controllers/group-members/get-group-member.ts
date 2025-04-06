import { getGroupMemberData } from '@/data/group-members/get-group-member';
import { groupMemberSchemaOpenApi } from '@/data/group-members/schema';
import { authenticationMiddleware } from '@/middlewares/authentication';
import { type AppRouteHandler } from '@/types/hono';
import { createRoute, z } from '@hono/zod-openapi';

export const getGroupMemberSchema = {
  params: z.object({
    group_member_id: z
      .string()
      .uuid()
      .openapi({ param: { name: 'group_member_id', in: 'path' }, example: crypto.randomUUID() }),
  }),
  response: groupMemberSchemaOpenApi,
};

export type GetGroupMemberParams = z.infer<typeof getGroupMemberSchema.params>;
export type GetGroupMemberResponse = z.infer<typeof getGroupMemberSchema.response>;

export const getGroupMemberRoute = createRoute({
  middleware: [authenticationMiddleware],
  security: [{ bearerAuth: [] }],
  method: 'get',
  path: '/group-members/{group_member_id}',
  tags: ['Group Members'],
  summary: 'Retrieve a group member',
  description: 'Retrieve the details of a group member.',
  request: {
    params: getGroupMemberSchema.params,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: getGroupMemberSchema.response,
        },
      },
      description: 'Group member retrieved successfully',
    },
  },
});

export const getGroupMemberRouteHandler: AppRouteHandler<typeof getGroupMemberRoute> = async c => {
  const dbClient = c.get('dbClient');
  const param = c.req.valid('param');

  const groupMember = await getGroupMemberData({ dbClient, id: param.group_member_id });

  return c.json(groupMember, { status: 200 });
};
