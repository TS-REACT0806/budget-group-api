import { type GroupMember } from '@/db/schema';
import { GroupMemberRole, GroupMemberStatus } from '@/db/types';
import { decimalNumberSchema } from '@/utils/zod-schemas';
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
  exact_share: decimalNumberSchema.nullable().openapi({
    example: '50.75',
  }),
  status: z.nativeEnum(GroupMemberStatus).openapi({
    example: GroupMemberStatus.PENDING,
  }),
  role: z.nativeEnum(GroupMemberRole).openapi({
    example: GroupMemberRole.MEMBER,
  }),
  placeholder_assignee_name: z.string().nullable().openapi({
    example: 'John Doe',
  }),
  user_id: z.string().uuid().openapi({
    example: '123e4567-e89b-12d3-a456-426614174002',
  }),
  group_id: z.string().uuid().openapi({
    example: '123e4567-e89b-12d3-a456-426614174003',
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
>;
export type UpdateGroupMember = Partial<GroupMember>;
