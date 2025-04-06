import { groupSchemaFields, groupSchemaOpenApi } from '@/data/groups/schema';
import { searchGroupsData } from '@/data/groups/search-groups';
import { type Group } from '@/db/schema';
import { authenticationMiddleware } from '@/middlewares/authentication';
import { type AppRouteHandler } from '@/types/hono';
import { createRoute, z } from '@hono/zod-openapi';

export const searchGroupsSchema = {
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
    sort_by: groupSchemaFields
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
    search_text: z
      .string()
      .openapi({
        param: {
          name: 'search_text',
          in: 'query',
        },
        example: 'weekend',
        description: 'Text to search for',
      })
      .optional(),
  }),
  response: z.object({
    records: z.array(groupSchemaOpenApi),
    total_records: z.number(),
    total_pages: z.number(),
    current_page: z.number(),
    next_page: z.number().nullable(),
    previous_page: z.number().nullable(),
  }),
};

export type SearchGroupsQuery = z.infer<typeof searchGroupsSchema.query>;
export type SearchGroupsResponse = z.infer<typeof searchGroupsSchema.response>;

export const searchGroupsRoute = createRoute({
  middleware: [authenticationMiddleware],
  security: [{ bearerAuth: [] }],
  method: 'get',
  path: '/groups/search',
  tags: ['Groups'],
  summary: 'Search groups',
  description: 'Search for groups with optional filters and pagination.',
  request: {
    query: searchGroupsSchema.query,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: searchGroupsSchema.response,
        },
      },
      description: 'Groups retrieved successfully',
    },
  },
});

export const searchGroupsRouteHandler: AppRouteHandler<typeof searchGroupsRoute> = async c => {
  const dbClient = c.get('dbClient');
  const query = c.req.valid('query');

  const result = await searchGroupsData({
    dbClient,
    limit: Number(query.limit),
    page: Number(query.page),
    sortBy: query.sort_by as keyof Group,
    orderBy: query.order_by as 'asc' | 'desc',
    includeArchived: query.include_archived === 'true',
    filters: {
      searchText: query.search_text,
    },
  });

  return c.json(result, { status: 200 });
};
