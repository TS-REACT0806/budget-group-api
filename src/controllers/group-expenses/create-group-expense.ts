import { createGroupExpenseData } from '@/data/group-expenses/create-group-expense';
import { groupExpenseSchema, groupExpenseSchemaOpenApi } from '@/data/group-expenses/schema';
import { authenticationMiddleware } from '@/middlewares/authentication';
import { type Session } from '@/types/auth';
import { type AppRouteHandler } from '@/types/hono';
import { NotFoundError } from '@/utils/errors';
import { createRoute, type z } from '@hono/zod-openapi';

export const createGroupExpenseSchema = {
  body: groupExpenseSchema.pick({
    group_id: true,
    amount: true,
    expense_date: true,
    description: true,
  }),
  response: groupExpenseSchemaOpenApi,
};

export type CreateGroupExpenseBody = z.infer<typeof createGroupExpenseSchema.body>;
export type CreateGroupExpenseResponse = z.infer<typeof createGroupExpenseSchema.response>;

export const createGroupExpenseRoute = createRoute({
  middleware: [authenticationMiddleware],
  security: [{ bearerAuth: [] }],
  method: 'post',
  path: '/group-expenses',
  tags: ['Group Expenses'],
  summary: 'Create a group expense',
  description: 'Create a new expense in a group.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createGroupExpenseSchema.body,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: createGroupExpenseSchema.response,
        },
      },
      description: 'Group expense created successfully',
    },
  },
});

export const createGroupExpenseRouteHandler: AppRouteHandler<
  typeof createGroupExpenseRoute
> = async c => {
  const dbClient = c.get('dbClient');
  const session = c.get('session') as Session;
  const body = c.req.valid('json');

  const createdGroupExpense = await createGroupExpenseData({
    dbClient,
    values: { ...body, owner_id: session.accountId },
  });

  if (!createdGroupExpense) throw new NotFoundError('No group expense created. Please try again.');

  return c.json(createdGroupExpense, { status: 201 });
};
