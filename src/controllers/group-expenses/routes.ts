import { type HonoEnv } from '@/types/hono';
import { OpenAPIHono } from '@hono/zod-openapi';
import { archiveGroupExpenseRoute, archiveGroupExpenseRouteHandler } from './archive-group-expense';
import { createGroupExpenseRoute, createGroupExpenseRouteHandler } from './create-group-expense';
import { deleteGroupExpenseRoute, deleteGroupExpenseRouteHandler } from './delete-group-expense';
import { getGroupExpenseRoute, getGroupExpenseRouteHandler } from './get-group-expense';
import { searchGroupExpensesRoute, searchGroupExpensesRouteHandler } from './search-group-expenses';
import { updateGroupExpenseRoute, updateGroupExpenseRouteHandler } from './update-group-expense';

const groupExpensesRoutes = new OpenAPIHono<HonoEnv>()
  .openapi(searchGroupExpensesRoute, searchGroupExpensesRouteHandler)
  .openapi(createGroupExpenseRoute, createGroupExpenseRouteHandler)
  .openapi(getGroupExpenseRoute, getGroupExpenseRouteHandler)
  .openapi(updateGroupExpenseRoute, updateGroupExpenseRouteHandler)
  .openapi(deleteGroupExpenseRoute, deleteGroupExpenseRouteHandler)
  .openapi(archiveGroupExpenseRoute, archiveGroupExpenseRouteHandler);

export default groupExpensesRoutes;
