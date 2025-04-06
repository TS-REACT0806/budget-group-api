import { createGroupData } from '@/data/groups/create-group';
import { groupSchema, groupSchemaOpenApi } from '@/data/groups/schema';
import { authenticationMiddleware } from '@/middlewares/authentication';
import { type Session } from '@/types/auth';
import { type AppRouteHandler } from '@/types/hono';
import { NotFoundError } from '@/utils/errors';
import { createRoute, type z } from '@hono/zod-openapi';

export const createGroupSchema = {
  body: groupSchema.pick({
    name: true,
    description: true,
    split_type: true,
  }),
  response: groupSchemaOpenApi,
};

export type CreateGroupBody = z.infer<typeof createGroupSchema.body>;
export type CreateGroupResponse = z.infer<typeof createGroupSchema.response>;

export const createGroupRoute = createRoute({
  middleware: [authenticationMiddleware],
  security: [{ bearerAuth: [] }],
  method: 'post',
  path: '/groups',
  tags: ['Groups'],
  summary: 'Create a group',
  description: 'Create a new group.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createGroupSchema.body,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: createGroupSchema.response,
        },
      },
      description: 'Group created successfully',
    },
  },
});

export const createGroupRouteHandler: AppRouteHandler<typeof createGroupRoute> = async c => {
  const dbClient = c.get('dbClient');
  const session = c.get('session') as Session;
  const body = c.req.valid('json');

  const createdGroup = await createGroupData({
    dbClient,
    values: { ...body, owner_id: session.accountId },
  });

  if (!createdGroup) throw new NotFoundError('No group created. Please try again.');

  return c.json(createdGroup, { status: 201 });
};
