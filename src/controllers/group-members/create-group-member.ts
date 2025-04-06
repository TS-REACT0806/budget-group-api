import { createGroupMemberData } from '@/data/group-members/create-group-member';
import { groupMemberSchema, groupMemberSchemaOpenApi } from '@/data/group-members/schema';
import { authenticationMiddleware } from '@/middlewares/authentication';
import { type AppRouteHandler } from '@/types/hono';
import { NotFoundError } from '@/utils/errors';
import { createRoute, type z } from '@hono/zod-openapi';

export const createGroupMemberSchema = {
  body: groupMemberSchema.pick({
    group_id: true,
    user_id: true,
    percentage_share: true,
    exact_share: true,
  }),
  response: groupMemberSchemaOpenApi,
};

export type CreateGroupMemberBody = z.infer<typeof createGroupMemberSchema.body>;
export type CreateGroupMemberResponse = z.infer<typeof createGroupMemberSchema.response>;

export const createGroupMemberRoute = createRoute({
  middleware: [authenticationMiddleware],
  security: [{ bearerAuth: [] }],
  method: 'post',
  path: '/group-members',
  tags: ['Group Members'],
  summary: 'Create a group member',
  description: 'Add a member to a group.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createGroupMemberSchema.body,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: createGroupMemberSchema.response,
        },
      },
      description: 'Group member created successfully',
    },
  },
});

export const createGroupMemberRouteHandler: AppRouteHandler<
  typeof createGroupMemberRoute
> = async c => {
  const dbClient = c.get('dbClient');
  const body = c.req.valid('json');

  const createdGroupMember = await createGroupMemberData({
    dbClient,
    values: body,
  });

  if (!createdGroupMember) throw new NotFoundError('No group member created. Please try again.');

  return c.json(createdGroupMember, { status: 201 });
};
