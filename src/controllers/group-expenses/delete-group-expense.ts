import { deleteGroupExpenseData } from '@/data/group-expenses/delete-group-expense';
import { authenticationMiddleware } from '@/middlewares/authentication';
import { type AppRouteHandler } from '@/types/hono';
import { NotFoundError } from '@/utils/errors';
import { createRoute, z } from '@hono/zod-openapi';

export const deleteGroupExpenseSchema = {
  params: z.object({
    group_expense_id: z
      .string()
      .uuid()
      .openapi({ param: { name: 'group_expense_id', in: 'path' }, example: crypto.randomUUID() }),
  }),
  response: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
};

export type DeleteGroupExpenseParams = z.infer<typeof deleteGroupExpenseSchema.params>;
export type DeleteGroupExpenseResponse = z.infer<typeof deleteGroupExpenseSchema.response>;

export const deleteGroupExpenseRoute = createRoute({
  middleware: [authenticationMiddleware],
  security: [{ bearerAuth: [] }],
  method: 'delete',
  path: '/group-expenses/{group_expense_id}',
  tags: ['Group Expenses'],
  summary: 'Delete a group expense',
  description: 'Delete a group expense permanently.',
  request: {
    params: deleteGroupExpenseSchema.params,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: deleteGroupExpenseSchema.response,
        },
      },
      description: 'Group expense deleted successfully',
    },
  },
});

export const deleteGroupExpenseRouteHandler: AppRouteHandler<
  typeof deleteGroupExpenseRoute
> = async c => {
  const dbClient = c.get('dbClient');
  const param = c.req.valid('param');

  const result = await deleteGroupExpenseData({
    dbClient,
    id: param.group_expense_id,
  });

  if (!result) throw new NotFoundError('Group expense not found.');

  return c.json(
    {
      success: true,
      message: 'Group expense deleted successfully',
    },
    { status: 200 }
  );
};
