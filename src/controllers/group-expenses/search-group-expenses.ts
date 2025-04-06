import { groupExpenseSchemaFields, groupExpenseSchemaOpenApi } from '@/data/group-expenses/schema';
import { searchGroupExpensesData } from '@/data/group-expenses/search-group-expenses';
import { type GroupExpense } from '@/db/schema';
import { authenticationMiddleware } from '@/middlewares/authentication';
import { type AppRouteHandler } from '@/types/hono';
import { createRoute, z } from '@hono/zod-openapi';

export const searchGroupExpensesSchema = {
  query: z.object({
    limit: z.string().openapi({
      param: {
        name: 'limit',
        in: 'query',
      },
      example: '25',
      description: 'Number of records to return',
    }),
    page: z.string().openapi({
      param: {
        name: 'page',
        in: 'query',
      },
      example: '1',
      description: 'Page number',
    }),
    sort_by: groupExpenseSchemaFields
      .openapi({
        param: {
          name: 'sort_by',
          in: 'query',
        },
        example: 'created_at',
        description: 'Field to sort by',
      })
      .optional(),
    order_by: z
      .enum(['asc', 'desc'])
      .openapi({
        param: {
          name: 'order_by',
          in: 'query',
        },
        example: 'desc',
        description: 'Order direction',
      })
      .optional(),
    include_archived: z
      .enum(['true', 'false'])
      .openapi({
        param: {
          name: 'include_archived',
          in: 'query',
        },
        example: 'false',
        description: 'Whether to include archived records',
      })
      .optional(),
    group_id: z
      .string()
      .uuid()
      .openapi({
        param: {
          name: 'group_id',
          in: 'query',
        },
        example: crypto.randomUUID(),
        description: 'Filter by group ID',
      })
      .optional(),
    owner_id: z
      .string()
      .uuid()
      .openapi({
        param: {
          name: 'owner_id',
          in: 'query',
        },
        example: crypto.randomUUID(),
        description: 'Filter by owner ID',
      })
      .optional(),
    search_text: z
      .string()
      .openapi({
        param: {
          name: 'search_text',
          in: 'query',
        },
        example: 'dinner',
        description: 'Text to search for in description',
      })
      .optional(),
    start_date: z
      .string()
      .openapi({
        param: {
          name: 'start_date',
          in: 'query',
        },
        example: '2023-01-01',
        description: 'Filter expenses after this date (yyyy-mm-dd)',
      })
      .optional(),
    end_date: z
      .string()
      .openapi({
        param: {
          name: 'end_date',
          in: 'query',
        },
        example: '2023-12-31',
        description: 'Filter expenses before this date (yyyy-mm-dd)',
      })
      .optional(),
  }),
  response: z.object({
    records: z.array(groupExpenseSchemaOpenApi),
    total_records: z.number(),
    total_pages: z.number(),
    current_page: z.number(),
    next_page: z.number().nullable(),
    previous_page: z.number().nullable(),
  }),
};

export type SearchGroupExpensesQuery = z.infer<typeof searchGroupExpensesSchema.query>;
export type SearchGroupExpensesResponse = z.infer<typeof searchGroupExpensesSchema.response>;

export const searchGroupExpensesRoute = createRoute({
  middleware: [authenticationMiddleware],
  security: [{ bearerAuth: [] }],
  method: 'get',
  path: '/group-expenses/search',
  tags: ['Group Expenses'],
  summary: 'Search group expenses',
  description: 'Search for group expenses with optional filters and pagination.',
  request: {
    query: searchGroupExpensesSchema.query,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: searchGroupExpensesSchema.response,
        },
      },
      description: 'Group expenses retrieved successfully',
    },
  },
});

export const searchGroupExpensesRouteHandler: AppRouteHandler<
  typeof searchGroupExpensesRoute
> = async c => {
  const dbClient = c.get('dbClient');
  const query = c.req.valid('query');

  const result = await searchGroupExpensesData({
    dbClient,
    limit: Number(query.limit),
    page: Number(query.page),
    sortBy: query.sort_by as keyof GroupExpense,
    orderBy: query.order_by as 'asc' | 'desc',
    includeArchived: query.include_archived === 'true',
    filters: {
      groupId: query.group_id,
      ownerId: query.owner_id,
      searchText: query.search_text,
      startDate: query.start_date ? new Date(query.start_date) : undefined,
      endDate: query.end_date ? new Date(query.end_date) : undefined,
    },
  });

  return c.json(result, { status: 200 });
};
