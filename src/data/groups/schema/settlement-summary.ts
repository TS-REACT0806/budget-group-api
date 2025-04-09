import { z } from 'zod';

export const settlementSummarySchema = z.object({
  last_calculated_at: z.union([z.coerce.date(), z.string()]).openapi({
    example: new Date().toISOString(),
  }),
  total: z.object({
    expenses: z.string(),
    payments: z.string(),
  }),
  members: z.record(
    z.string(),
    z.object({
      net_balance: z.string(),
      total_spent: z.string(),
      total_share: z.string(),
      balances: z.record(z.string(), z.string()),
    })
  ),
});

export type SettlementSummary = z.infer<typeof settlementSummarySchema>;
