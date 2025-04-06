import { groupMemberSchemaOpenApi } from '@/data/group-members/schema';
import { updateGroupMemberData } from '@/data/group-members/update-group-member';
import { authenticationMiddleware } from '@/middlewares/authentication';
import { type AppRouteHandler } from '@/types/hono';
import { NotFoundError } from '@/utils/errors';
import { createRoute, z } from '@hono/zod-openapi';
import { sql } from 'kysely';

export const archiveGroupMemberSchema = {
  params: z.object({
    group_member_id: z
      .string()
      .uuid()
      .openapi({ param: { name: 'group_member_id', in: 'path' }, example: crypto.randomUUID() }),
  }),
  response: groupMemberSchemaOpenApi,
};

export type ArchiveGroupMemberParams = z.infer<typeof archiveGroupMemberSchema.params>;
export type ArchiveGroupMemberResponse = z.infer<typeof archiveGroupMemberSchema.response>;

export const archiveGroupMemberRoute = createRoute({
  middleware: [authenticationMiddleware],
  security: [{ bearerAuth: [] }],
  method: 'put',
  path: '/group-members/{group_member_id}/archive',
  tags: ['Group Members'],
  summary: 'Archive a group member',
  description: 'Archive a group member (soft delete).',
  request: {
    params: archiveGroupMemberSchema.params,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: archiveGroupMemberSchema.response,
        },
      },
      description: 'Group member archived successfully',
    },
  },
});

export const archiveGroupMemberRouteHandler: AppRouteHandler<
  typeof archiveGroupMemberRoute
> = async c => {
  const dbClient = c.get('dbClient');
  const param = c.req.valid('param');

  const archivedGroupMember = await updateGroupMemberData({
    dbClient,
    id: param.group_member_id,
    values: { deleted_at: sql`NOW()` as unknown as Date },
  });

  if (!archivedGroupMember) throw new NotFoundError('Group member not found.');

  return c.json(archivedGroupMember, { status: 200 });
};
