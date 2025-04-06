import { groupMemberSchema, groupMemberSchemaOpenApi } from '@/data/group-members/schema';
import { updateGroupMemberData } from '@/data/group-members/update-group-member';
import { authenticationMiddleware } from '@/middlewares/authentication';
import { type AppRouteHandler } from '@/types/hono';
import { NotFoundError } from '@/utils/errors';
import { createRoute, z } from '@hono/zod-openapi';

export const updateGroupMemberSchema = {
  params: z.object({
    group_member_id: z
      .string()
      .uuid()
      .openapi({ param: { name: 'group_member_id', in: 'path' }, example: crypto.randomUUID() }),
  }),
  body: groupMemberSchema
    .pick({
      percentage_share: true,
      exact_share: true,
    })
    .partial(),
  response: groupMemberSchemaOpenApi,
};

export type UpdateGroupMemberParams = z.infer<typeof updateGroupMemberSchema.params>;
export type UpdateGroupMemberBody = z.infer<typeof updateGroupMemberSchema.body>;
export type UpdateGroupMemberResponse = z.infer<typeof updateGroupMemberSchema.response>;

export const updateGroupMemberRoute = createRoute({
  middleware: [authenticationMiddleware],
  security: [{ bearerAuth: [] }],
  method: 'put',
  path: '/group-members/{group_member_id}',
  tags: ['Group Members'],
  summary: 'Update a group member',
  description: 'Update the details of a group member.',
  request: {
    params: updateGroupMemberSchema.params,
    body: {
      content: {
        'application/json': {
          schema: updateGroupMemberSchema.body,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: updateGroupMemberSchema.response,
        },
      },
      description: 'Group member updated successfully',
    },
  },
});

export const updateGroupMemberRouteHandler: AppRouteHandler<
  typeof updateGroupMemberRoute
> = async c => {
  const dbClient = c.get('dbClient');
  const param = c.req.valid('param');
  const body = c.req.valid('json');

  const updatedGroupMember = await updateGroupMemberData({
    dbClient,
    id: param.group_member_id,
    values: body,
  });

  if (!updatedGroupMember) throw new NotFoundError('Group member not found.');

  return c.json(updatedGroupMember, { status: 200 });
};
