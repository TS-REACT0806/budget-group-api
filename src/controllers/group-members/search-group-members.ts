import { groupMemberSchemaFields, groupMemberSchemaOpenApi } from '@/data/group-members/schema';
import { searchGroupMembersData } from '@/data/group-members/search-group-members';
import { type GroupMember } from '@/db/schema';
import { authenticationMiddleware } from '@/middlewares/authentication';
import { type AppRouteHandler } from '@/types/hono';
import { createRoute, z } from '@hono/zod-openapi';

export const searchGroupMembersSchema = {
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
    sort_by: groupMemberSchemaFields
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
    user_id: z
      .string()
      .uuid()
      .openapi({
        param: {
          name: 'user_id',
          in: 'query',
        },
        example: crypto.randomUUID(),
        description: 'Filter by user ID',
      })
      .optional(),
  }),
  response: z.object({
    records: z.array(groupMemberSchemaOpenApi),
    total_records: z.number(),
    total_pages: z.number(),
    current_page: z.number(),
    next_page: z.number().nullable(),
    previous_page: z.number().nullable(),
  }),
};

export type SearchGroupMembersQuery = z.infer<typeof searchGroupMembersSchema.query>;
export type SearchGroupMembersResponse = z.infer<typeof searchGroupMembersSchema.response>;

export const searchGroupMembersRoute = createRoute({
  middleware: [authenticationMiddleware],
  security: [{ bearerAuth: [] }],
  method: 'get',
  path: '/group-members/search',
  tags: ['Group Members'],
  summary: 'Search group members',
  description: 'Search for group members with optional filters and pagination.',
  request: {
    query: searchGroupMembersSchema.query,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: searchGroupMembersSchema.response,
        },
      },
      description: 'Group members retrieved successfully',
    },
  },
});

export const searchGroupMembersRouteHandler: AppRouteHandler<
  typeof searchGroupMembersRoute
> = async c => {
  const dbClient = c.get('dbClient');
  const query = c.req.valid('query');

  const result = await searchGroupMembersData({
    dbClient,
    limit: Number(query.limit),
    page: Number(query.page),
    sortBy: query.sort_by as keyof GroupMember,
    orderBy: query.order_by as 'asc' | 'desc',
    includeArchived: query.include_archived === 'true',
    filters: {
      groupId: query.group_id,
      userId: query.user_id,
    },
  });

  return c.json(result, { status: 200 });
};
