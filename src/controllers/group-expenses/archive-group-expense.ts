import { groupExpenseSchemaOpenApi } from '@/data/group-expenses/schema';
import { updateGroupExpenseData } from '@/data/group-expenses/update-group-expense';
import { authenticationMiddleware } from '@/middlewares/authentication';
import { type AppRouteHandler } from '@/types/hono';
import { NotFoundError } from '@/utils/errors';
import { createRoute, z } from '@hono/zod-openapi';
import { sql } from 'kysely';

export const archiveGroupExpenseSchema = {
  params: z.object({
    group_expense_id: z
      .string()
      .uuid()
      .openapi({ param: { name: 'group_expense_id', in: 'path' }, example: crypto.randomUUID() }),
  }),
  response: groupExpenseSchemaOpenApi,
};

export type ArchiveGroupExpenseParams = z.infer<typeof archiveGroupExpenseSchema.params>;
export type ArchiveGroupExpenseResponse = z.infer<typeof archiveGroupExpenseSchema.response>;

export const archiveGroupExpenseRoute = createRoute({
  middleware: [authenticationMiddleware],
  security: [{ bearerAuth: [] }],
  method: 'put',
  path: '/group-expenses/{group_expense_id}/archive',
  tags: ['Group Expenses'],
  summary: 'Archive a group expense',
  description: 'Archive a group expense (soft delete).',
  request: {
    params: archiveGroupExpenseSchema.params,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: archiveGroupExpenseSchema.response,
        },
      },
      description: 'Group expense archived successfully',
    },
  },
});

export const archiveGroupExpenseRouteHandler: AppRouteHandler<
  typeof archiveGroupExpenseRoute
> = async c => {
  const dbClient = c.get('dbClient');
  const param = c.req.valid('param');

  const archivedGroupExpense = await updateGroupExpenseData({
    dbClient,
    id: param.group_expense_id,
    values: { deleted_at: sql`NOW()` as unknown as Date },
  });

  if (!archivedGroupExpense) throw new NotFoundError('Group expense not found.');

  return c.json(archivedGroupExpense, { status: 200 });
};
