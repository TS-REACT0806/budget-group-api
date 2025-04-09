import { type Group } from '@/db/schema';
import { GroupSplitType } from '@/db/types';
import { z } from '@hono/zod-openapi';
import { settlementSummarySchema } from './settlement-summary';

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
  tag: z.string().nullable().openapi({
    example: 'trip',
  }),
  split_type: z.nativeEnum(GroupSplitType).openapi({
    example: GroupSplitType.EQUAL,
  }),
  settlement_summary: settlementSummarySchema.nullable().openapi({
    example: null,
  }),
};

export const groupSchema = z.object(groupSchemaObject) satisfies z.ZodType<Group>;
export const groupSchemaOpenApi = groupSchema.openapi('Group');
export const groupSchemaFields = z.enum(Object.keys(groupSchemaObject) as [string, ...string[]]);

export type CreateGroup = Omit<Group, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
export type UpdateGroup = Partial<Group>;
