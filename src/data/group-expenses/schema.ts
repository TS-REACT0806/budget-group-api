import { type GroupExpense } from '@/db/schema';
import { z } from '@hono/zod-openapi';

export const groupExpenseSchemaObject = {
  id: z.string().uuid(),
  created_at: z.union([z.coerce.date(), z.string()]).openapi({
    example: new Date().toISOString(),
  }),
  updated_at: z.union([z.coerce.date(), z.string()]).openapi({
    example: new Date().toISOString(),
  }),
  deleted_at: z.union([z.coerce.date(), z.string()]).nullable().openapi({
    example: null,
  }),
  amount: z.string().openapi({
    example: '150.75',
  }),
  expense_date: z.union([z.coerce.date(), z.string(), z.null()]).nullable().openapi({
    example: new Date().toISOString(),
  }),
  description: z.string().nullable().openapi({
    example: 'Dinner at restaurant',
  }),
  group_id: z.string().uuid().openapi({
    example: '123e4567-e89b-12d3-a456-426614174001',
  }),
  owner_id: z.string().uuid().openapi({
    example: '123e4567-e89b-12d3-a456-426614174002',
  }),
};

export const groupExpenseSchema = z.object(
  groupExpenseSchemaObject
) satisfies z.ZodType<GroupExpense>;
export const groupExpenseSchemaOpenApi = groupExpenseSchema.openapi('GroupExpense');
export const groupExpenseSchemaFields = z.enum(
  Object.keys(groupExpenseSchemaObject) as [string, ...string[]]
);

export type CreateGroupExpense = Omit<
  GroupExpense,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
> & {
  id?: string;
};
export type UpdateGroupExpense = Partial<GroupExpense>;
