import { deleteGroupMemberData } from '@/data/group-members/delete-group-member';
import { authenticationMiddleware } from '@/middlewares/authentication';
import { type AppRouteHandler } from '@/types/hono';
import { NotFoundError } from '@/utils/errors';
import { createRoute, z } from '@hono/zod-openapi';

export const deleteGroupMemberSchema = {
  params: z.object({
    group_member_id: z
      .string()
      .uuid()
      .openapi({ param: { name: 'group_member_id', in: 'path' }, example: crypto.randomUUID() }),
  }),
  response: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
};

export type DeleteGroupMemberParams = z.infer<typeof deleteGroupMemberSchema.params>;
export type DeleteGroupMemberResponse = z.infer<typeof deleteGroupMemberSchema.response>;

export const deleteGroupMemberRoute = createRoute({
  middleware: [authenticationMiddleware],
  security: [{ bearerAuth: [] }],
  method: 'delete',
  path: '/group-members/{group_member_id}',
  tags: ['Group Members'],
  summary: 'Delete a group member',
  description: 'Delete a group member permanently.',
  request: {
    params: deleteGroupMemberSchema.params,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: deleteGroupMemberSchema.response,
        },
      },
      description: 'Group member deleted successfully',
    },
  },
});

export const deleteGroupMemberRouteHandler: AppRouteHandler<
  typeof deleteGroupMemberRoute
> = async c => {
  const dbClient = c.get('dbClient');
  const param = c.req.valid('param');

  const result = await deleteGroupMemberData({
    dbClient,
    id: param.group_member_id,
  });

  if (!result) throw new NotFoundError('Group member not found.');

  return c.json(
    {
      success: true,
      message: 'Group member deleted successfully',
    },
    { status: 200 }
  );
};
