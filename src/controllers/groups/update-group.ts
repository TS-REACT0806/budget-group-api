import { groupSchema, groupSchemaOpenApi } from '@/data/groups/schema';
import { updateGroupData } from '@/data/groups/update-group';
import { authenticationMiddleware } from '@/middlewares/authentication';
import { type AppRouteHandler } from '@/types/hono';
import { NotFoundError } from '@/utils/errors';
import { createRoute, z } from '@hono/zod-openapi';

export const updateGroupSchema = {
  params: z.object({
    group_id: z
      .string()
      .uuid()
      .openapi({ param: { name: 'group_id', in: 'path' }, example: crypto.randomUUID() }),
  }),
  body: groupSchema
    .pick({
      name: true,
      description: true,
      split_type: true,
    })
    .partial(),
  response: groupSchemaOpenApi,
};

export type UpdateGroupParams = z.infer<typeof updateGroupSchema.params>;
export type UpdateGroupBody = z.infer<typeof updateGroupSchema.body>;
export type UpdateGroupResponse = z.infer<typeof updateGroupSchema.response>;

export const updateGroupRoute = createRoute({
  middleware: [authenticationMiddleware],
  security: [{ bearerAuth: [] }],
  method: 'put',
  path: '/groups/{group_id}',
  tags: ['Groups'],
  summary: 'Update a group',
  description: 'Update the details of a group.',
  request: {
    params: updateGroupSchema.params,
    body: {
      content: {
        'application/json': {
          schema: updateGroupSchema.body,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: updateGroupSchema.response,
        },
      },
      description: 'Group updated successfully',
    },
  },
});

export const updateGroupRouteHandler: AppRouteHandler<typeof updateGroupRoute> = async c => {
  const dbClient = c.get('dbClient');
  const param = c.req.valid('param');
  const body = c.req.valid('json');

  const updatedGroup = await updateGroupData({
    dbClient,
    id: param.group_id,
    values: body,
  });

  if (!updatedGroup) throw new NotFoundError('Group not found.');

  return c.json(updatedGroup, { status: 200 });
};
