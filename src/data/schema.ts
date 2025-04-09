import { featureFlagSchemaOpenApi } from './feature-flags/schema';
import { groupExpenseSchemaOpenApi } from './group-expenses/schema';
import { groupMemberSchemaOpenApi } from './group-members/schema';
import { groupPaymentTransactionSchemaOpenApi } from './group-payment-transactions/schema';
import { groupSchemaOpenApi } from './groups/schema';
import { userSchemaOpenApi } from './users/schema';

export const schemas = {
  FeatureFlag: featureFlagSchemaOpenApi,
  User: userSchemaOpenApi,
  Group: groupSchemaOpenApi,
  GroupMember: groupMemberSchemaOpenApi,
  GroupExpense: groupExpenseSchemaOpenApi,
  GroupPaymentTransaction: groupPaymentTransactionSchemaOpenApi,
} as const;
