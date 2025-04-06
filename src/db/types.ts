import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const UserRoleType = {
    SUPER_ADMIN: "SUPER_ADMIN",
    ADMIN: "ADMIN",
    USER: "USER"
} as const;
export type UserRoleType = (typeof UserRoleType)[keyof typeof UserRoleType];
export const SplitType = {
    EQUAL: "EQUAL",
    PERCENTAGE: "PERCENTAGE",
    EXACT: "EXACT"
} as const;
export type SplitType = (typeof SplitType)[keyof typeof SplitType];
export type accounts = {
    id: Generated<string>;
    created_at: Generated<Timestamp>;
    updated_at: Generated<Timestamp>;
    deleted_at: Timestamp | null;
    email: string;
    password: string;
};
export type feature_flags = {
    id: Generated<string>;
    created_at: Generated<Timestamp>;
    updated_at: Generated<Timestamp>;
    deleted_at: Timestamp | null;
    role: UserRoleType;
    json: unknown;
};
export type group_expenses = {
    id: Generated<string>;
    created_at: Generated<Timestamp>;
    updated_at: Generated<Timestamp>;
    deleted_at: Timestamp | null;
    amount: string;
    expense_date: Timestamp | null;
    description: string | null;
    group_id: string;
    owner_id: string;
};
export type group_members = {
    id: Generated<string>;
    created_at: Generated<Timestamp>;
    updated_at: Generated<Timestamp>;
    deleted_at: Timestamp | null;
    percentage_share: number | null;
    exact_share: string | null;
    group_id: string;
    user_id: string;
};
export type groups = {
    id: Generated<string>;
    created_at: Generated<Timestamp>;
    updated_at: Generated<Timestamp>;
    deleted_at: Timestamp | null;
    name: string;
    description: string | null;
    split_type: Generated<SplitType>;
    owner_id: string;
};
export type sessions = {
    id: Generated<string>;
    created_at: Generated<Timestamp>;
    updated_at: Generated<Timestamp>;
    deleted_at: Timestamp | null;
    refresh_token: string;
    account_id: string;
};
export type users = {
    id: Generated<string>;
    created_at: Generated<Timestamp>;
    updated_at: Generated<Timestamp>;
    deleted_at: Timestamp | null;
    first_name: string | null;
    last_name: string | null;
    mobile_no: string | null;
    email: string;
    role: Generated<UserRoleType>;
};
export type DB = {
    accounts: accounts;
    feature_flags: feature_flags;
    group_expenses: group_expenses;
    group_members: group_members;
    groups: groups;
    sessions: sessions;
    users: users;
};
