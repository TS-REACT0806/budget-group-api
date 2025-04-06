import { deleteGroupData } from '@/data/groups/delete-group';
import { authenticationMiddleware } from '@/middlewares/authentication';
import { type AppRouteHandler } from '@/types/hono';
import { NotFoundError } from '@/utils/errors';
import { createRoute, z } from '@hono/zod-openapi';

export const deleteGroupSchema = {
  params: z.object({
    group_id: z
      .string()
      .uuid()
      .openapi({ param: { name: 'group_id', in: 'path' }, example: crypto.randomUUID() }),
  }),
  response: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
};

export type DeleteGroupParams = z.infer<typeof deleteGroupSchema.params>;
export type DeleteGroupResponse = z.infer<typeof deleteGroupSchema.response>;

export const deleteGroupRoute = createRoute({
  middleware: [authenticationMiddleware],
  security: [{ bearerAuth: [] }],
  method: 'delete',
  path: '/groups/{group_id}',
  tags: ['Groups'],
  summary: 'Delete a group',
  description: 'Delete a group permanently.',
  request: {
    params: deleteGroupSchema.params,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: deleteGroupSchema.response,
        },
      },
      description: 'Group deleted successfully',
    },
  },
});

export const deleteGroupRouteHandler: AppRouteHandler<typeof deleteGroupRoute> = async c => {
  const dbClient = c.get('dbClient');
  const param = c.req.valid('param');

  const result = await deleteGroupData({
    dbClient,
    id: param.group_id,
  });

  if (!result) throw new NotFoundError('Group not found.');

  return c.json(
    {
      success: true,
      message: 'Group deleted successfully',
    },
    { status: 200 }
  );
};
