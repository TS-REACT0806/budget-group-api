import { featureFlagSchemaOpenApi } from './feature-flags/schema';
import { groupSchemaOpenApi } from './groups/schema';
import { userSchemaOpenApi } from './users/schema';

export const schemas = {
  FeatureFlag: featureFlagSchemaOpenApi,
  User: userSchemaOpenApi,
  Group: groupSchemaOpenApi,
} as const;
