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
export const GroupSplitType = {
    EQUAL: "EQUAL",
    PERCENTAGE: "PERCENTAGE",
    EXACT: "EXACT"
} as const;
export type GroupSplitType = (typeof GroupSplitType)[keyof typeof GroupSplitType];
export const GroupMemberStatus = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED"
} as const;
export type GroupMemberStatus = (typeof GroupMemberStatus)[keyof typeof GroupMemberStatus];
export const GroupMemberRole = {
    OWNER: "OWNER",
    ADMIN: "ADMIN",
    MEMBER: "MEMBER"
} as const;
export type GroupMemberRole = (typeof GroupMemberRole)[keyof typeof GroupMemberRole];
export const GroupPaymentTransactionStatus = {
    REQUESTED: "REQUESTED",
    PAID: "PAID",
    REJECTED: "REJECTED",
    VOIDED: "VOIDED"
} as const;
export type GroupPaymentTransactionStatus = (typeof GroupPaymentTransactionStatus)[keyof typeof GroupPaymentTransactionStatus];
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
    tag: string | null;
    group_id: string;
    member_id: string;
};
export type group_members = {
    id: Generated<string>;
    created_at: Generated<Timestamp>;
    updated_at: Generated<Timestamp>;
    deleted_at: Timestamp | null;
    percentage_share: number | null;
    exact_share: string | null;
    status: Generated<GroupMemberStatus>;
    role: Generated<GroupMemberRole>;
    placeholder_assignee_name: string | null;
    user_id: string | null;
    group_id: string;
};
export type group_payment_transactions = {
    id: Generated<string>;
    created_at: Generated<Timestamp>;
    updated_at: Generated<Timestamp>;
    deleted_at: Timestamp | null;
    amount: string;
    description: string | null;
    status: Generated<GroupPaymentTransactionStatus>;
    group_id: string;
    sender_member_id: string;
    receiver_member_id: string;
};
export type groups = {
    id: Generated<string>;
    created_at: Generated<Timestamp>;
    updated_at: Generated<Timestamp>;
    deleted_at: Timestamp | null;
    name: string;
    description: string | null;
    tag: string | null;
    split_type: Generated<GroupSplitType>;
    settlement_summary: unknown | null;
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
    group_payment_transactions: group_payment_transactions;
    groups: groups;
    sessions: sessions;
    users: users;
};
