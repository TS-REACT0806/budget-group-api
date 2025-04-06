import { groupExpenseSchema, groupExpenseSchemaOpenApi } from '@/data/group-expenses/schema';
import { updateGroupExpenseData } from '@/data/group-expenses/update-group-expense';
import { authenticationMiddleware } from '@/middlewares/authentication';
import { type AppRouteHandler } from '@/types/hono';
import { NotFoundError } from '@/utils/errors';
import { createRoute, z } from '@hono/zod-openapi';

export const updateGroupExpenseSchema = {
  params: z.object({
    group_expense_id: z
      .string()
      .uuid()
      .openapi({ param: { name: 'group_expense_id', in: 'path' }, example: crypto.randomUUID() }),
  }),
  body: groupExpenseSchema
    .pick({
      amount: true,
      expense_date: true,
      description: true,
    })
    .partial(),
  response: groupExpenseSchemaOpenApi,
};

export type UpdateGroupExpenseParams = z.infer<typeof updateGroupExpenseSchema.params>;
export type UpdateGroupExpenseBody = z.infer<typeof updateGroupExpenseSchema.body>;
export type UpdateGroupExpenseResponse = z.infer<typeof updateGroupExpenseSchema.response>;

export const updateGroupExpenseRoute = createRoute({
  middleware: [authenticationMiddleware],
  security: [{ bearerAuth: [] }],
  method: 'put',
  path: '/group-expenses/{group_expense_id}',
  tags: ['Group Expenses'],
  summary: 'Update a group expense',
  description: 'Update the details of a group expense.',
  request: {
    params: updateGroupExpenseSchema.params,
    body: {
      content: {
        'application/json': {
          schema: updateGroupExpenseSchema.body,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: updateGroupExpenseSchema.response,
        },
      },
      description: 'Group expense updated successfully',
    },
  },
});

export const updateGroupExpenseRouteHandler: AppRouteHandler<
  typeof updateGroupExpenseRoute
> = async c => {
  const dbClient = c.get('dbClient');
  const param = c.req.valid('param');
  const body = c.req.valid('json');

  const updatedGroupExpense = await updateGroupExpenseData({
    dbClient,
    id: param.group_expense_id,
    values: body,
  });

  if (!updatedGroupExpense) throw new NotFoundError('Group expense not found.');

  return c.json(updatedGroupExpense, { status: 200 });
};
