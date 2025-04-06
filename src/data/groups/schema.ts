import { type Group } from '@/db/schema';
import { SplitType } from '@/db/types';
import { z } from '@hono/zod-openapi';

export const groupSchemaObject = {
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
  name: z.string().openapi({
    example: 'Weekend Trip',
  }),
  description: z.string().nullable().openapi({
    example: 'Group for our weekend trip expenses',
  }),
  split_type: z.nativeEnum(SplitType).openapi({
    example: SplitType.EQUAL,
  }),
  owner_id: z.string().uuid().openapi({
    example: '123e4567-e89b-12d3-a456-426614174000',
  }),
};

export const groupSchema = z.object(groupSchemaObject) satisfies z.ZodType<Group>;
export const groupSchemaOpenApi = groupSchema.openapi('Group');
export const groupSchemaFields = z.enum(Object.keys(groupSchemaObject) as [string, ...string[]]);

export type CreateGroup = Omit<Group, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> & {
  id?: string;
};
export type UpdateGroup = Partial<Group>;
