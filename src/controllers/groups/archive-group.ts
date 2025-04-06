import { groupSchemaOpenApi } from '@/data/groups/schema';
import { updateGroupData } from '@/data/groups/update-group';
import { authenticationMiddleware } from '@/middlewares/authentication';
import { type AppRouteHandler } from '@/types/hono';
import { NotFoundError } from '@/utils/errors';
import { createRoute, z } from '@hono/zod-openapi';
import { sql } from 'kysely';

export const archiveGroupSchema = {
  params: z.object({
    group_id: z
      .string()
      .uuid()
      .openapi({ param: { name: 'group_id', in: 'path' }, example: crypto.randomUUID() }),
  }),
  response: groupSchemaOpenApi,
};

export type ArchiveGroupParams = z.infer<typeof archiveGroupSchema.params>;
export type ArchiveGroupResponse = z.infer<typeof archiveGroupSchema.response>;

export const archiveGroupRoute = createRoute({
  middleware: [authenticationMiddleware],
  security: [{ bearerAuth: [] }],
  method: 'put',
  path: '/groups/{group_id}/archive',
  tags: ['Groups'],
  summary: 'Archive a group',
  description: 'Archive a group (soft delete).',
  request: {
    params: archiveGroupSchema.params,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: archiveGroupSchema.response,
        },
      },
      description: 'Group archived successfully',
    },
  },
});

export const archiveGroupRouteHandler: AppRouteHandler<typeof archiveGroupRoute> = async c => {
  const dbClient = c.get('dbClient');
  const param = c.req.valid('param');

  const archivedGroup = await updateGroupData({
    dbClient,
    id: param.group_id,
    values: { deleted_at: sql`NOW()` as unknown as Date },
  });

  if (!archivedGroup) throw new NotFoundError('Group not found.');

  return c.json(archivedGroup, { status: 200 });
};
