import { type GroupMember } from '@/db/schema';
import { z } from '@hono/zod-openapi';

export const groupMemberSchemaObject = {
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
  percentage_share: z.number().nullable().openapi({
    example: 25.5,
  }),
  exact_share: z.union([z.string(), z.null()]).nullable().openapi({
    example: '50.75',
  }),
  group_id: z.string().uuid().openapi({
    example: '123e4567-e89b-12d3-a456-426614174001',
  }),
  user_id: z.string().uuid().openapi({
    example: '123e4567-e89b-12d3-a456-426614174002',
  }),
};

export const groupMemberSchema = z.object(groupMemberSchemaObject) satisfies z.ZodType<GroupMember>;
export const groupMemberSchemaOpenApi = groupMemberSchema.openapi('GroupMember');
export const groupMemberSchemaFields = z.enum(
  Object.keys(groupMemberSchemaObject) as [string, ...string[]]
);

export type CreateGroupMember = Omit<
  GroupMember,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
> & {
  id?: string;
};
export type UpdateGroupMember = Partial<GroupMember>;
