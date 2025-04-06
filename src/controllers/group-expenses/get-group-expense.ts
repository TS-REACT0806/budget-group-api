import { getGroupExpenseData } from '@/data/group-expenses/get-group-expense';
import { groupExpenseSchemaOpenApi } from '@/data/group-expenses/schema';
import { authenticationMiddleware } from '@/middlewares/authentication';
import { type AppRouteHandler } from '@/types/hono';
import { createRoute, z } from '@hono/zod-openapi';

export const getGroupExpenseSchema = {
  params: z.object({
    group_expense_id: z
      .string()
      .uuid()
      .openapi({ param: { name: 'group_expense_id', in: 'path' }, example: crypto.randomUUID() }),
  }),
  response: groupExpenseSchemaOpenApi,
};

export type GetGroupExpenseParams = z.infer<typeof getGroupExpenseSchema.params>;
export type GetGroupExpenseResponse = z.infer<typeof getGroupExpenseSchema.response>;

export const getGroupExpenseRoute = createRoute({
  middleware: [authenticationMiddleware],
  security: [{ bearerAuth: [] }],
  method: 'get',
  path: '/group-expenses/{group_expense_id}',
  tags: ['Group Expenses'],
  summary: 'Retrieve a group expense',
  description: 'Retrieve the details of a group expense.',
  request: {
    params: getGroupExpenseSchema.params,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: getGroupExpenseSchema.response,
        },
      },
      description: 'Group expense retrieved successfully',
    },
  },
});

export const getGroupExpenseRouteHandler: AppRouteHandler<
  typeof getGroupExpenseRoute
> = async c => {
  const dbClient = c.get('dbClient');
  const param = c.req.valid('param');

  const groupExpense = await getGroupExpenseData({ dbClient, id: param.group_expense_id });

  return c.json(groupExpense, { status: 200 });
};
