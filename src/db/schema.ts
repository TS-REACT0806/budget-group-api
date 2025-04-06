import {
  type accounts,
  type DB,
  type feature_flags,
  type group_expenses,
  type group_members,
  type groups,
  type sessions,
  type SplitType,
  type UserRoleType,
  type users,
} from './types';

/**
 * Utility type to override specific field types from database tables:
 * - DATE fields: converted to `Date | string` if not null else do `Date | string | null`
 * - JSON fields: specific type overrides
 * - w/ DEFAULT fields: any field with a default value
 * @example
 * type SampleTable = {
 *   id: Generated<string>; // w/o DEFAULT
 *   name: string; // w/o DEFAULT
 *   created_at: Generated<Timestamp>; // w/ DEFAULT
 *   updated_at: Generated<Timestamp>; // w/ DEFAULT
 *   deleted_at: Timestamp | null; // w/o DEFAULT
 *   status: Generated<UserStatusType>; // w/ DEFAULT
 *   json: unknown; // w/o DEFAULT
 *   is_active: Generated<boolean>; // w/ DEFAULT
 * };
 *
 * type OverrideSampleTable = Omit<OverrideCommonFields<SampleTable>, 'status'> & {
 *   status: UserStatusType;
 *   json: SomeJsonType;
 *   is_active: boolean;
 * };
 */
type OverrideCommonFields<TTable> = Omit<
  TTable,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
> & {
  id: string;
  created_at: Date | string;
  updated_at: Date | string;
  deleted_at: Date | string | null;
};

type OverrideUsers = Omit<OverrideCommonFields<users>, 'role'> & {
  role: UserRoleType;
};

export const FEATURE_FLAG_SCOPES = [
  'users:read:*',
  'users:write:*',
  'users:write:create',
  'users:write:update',
  'users:write:delete',
  'users:write:archive',
  'users:write:restore',

  'products:read:*',
] as const;

export type FeatureFlagScope = (typeof FEATURE_FLAG_SCOPES)[number];

export type OverrideFeatureFlags = Omit<OverrideCommonFields<feature_flags>, 'json'> & {
  json: Array<FeatureFlagScope>;
};

export type OverrideGroup = Omit<OverrideCommonFields<groups>, 'split_type'> & {
  split_type: SplitType;
};

export type OverrideGroupExpense = Omit<OverrideCommonFields<group_expenses>, 'expense_date'> & {
  expense_date: Date | string | null;
};

export type Group = OverrideGroup;
export type GroupMember = OverrideCommonFields<group_members>;
export type GroupExpense = OverrideGroupExpense;
export type User = OverrideUsers;
export type Account = OverrideCommonFields<accounts>;
export type Session = OverrideCommonFields<sessions>;
export type FeatureFlag = OverrideFeatureFlags;

export type KyselySchema = DB;
