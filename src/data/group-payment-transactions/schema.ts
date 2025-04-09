import { type GroupPaymentTransaction } from '@/db/schema';
import { GroupPaymentTransactionStatus } from '@/db/types';
import { decimalNumberSchema } from '@/utils/zod-schemas';
import { z } from '@hono/zod-openapi';

export const groupPaymentTransactionSchemaObject = {
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
  amount: decimalNumberSchema.openapi({
    example: '100.00',
  }),
  description: z.string().nullable().openapi({
    example: 'Payment for the group',
  }),
  status: z.nativeEnum(GroupPaymentTransactionStatus).openapi({
    example: GroupPaymentTransactionStatus.REQUESTED,
  }),
  group_id: z.string().uuid().openapi({
    example: '123e4567-e89b-12d3-a456-426614174003',
  }),
  sender_member_id: z.string().uuid().openapi({
    example: '123e4567-e89b-12d3-a456-426614174002',
  }),
  receiver_member_id: z.string().uuid().openapi({
    example: '123e4567-e89b-12d3-a456-426614174002',
  }),
};

export const groupPaymentTransactionSchema = z.object(
  groupPaymentTransactionSchemaObject
) satisfies z.ZodType<GroupPaymentTransaction>;
export const groupPaymentTransactionSchemaOpenApi =
  groupPaymentTransactionSchema.openapi('GroupPaymentTransaction');
export const groupPaymentTransactionSchemaFields = z.enum(
  Object.keys(groupPaymentTransactionSchemaObject) as [string, ...string[]]
);

export type CreateGroupPaymentTransaction = Omit<
  GroupPaymentTransaction,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;
export type UpdateGroupPaymentTransaction = Partial<GroupPaymentTransaction>;
