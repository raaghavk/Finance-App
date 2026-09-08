/**
 * Notion Expenses schema — mirror of collection://b35c3e74-0bc7-432d-8309-80a7583d3601
 * Database: https://app.notion.com/p/76941781c8ef4d258923b9c2a6750292
 *
 * Currency is INR (Notion number format: rupee).
 * Writes are owned by Expense Tracker. This app is read-only.
 */

export const NOTION_EXPENSES_DATABASE_ID = '76941781c8ef4d258923b9c2a6750292';
export const NOTION_EXPENSES_DATA_SOURCE_ID = 'b35c3e74-0bc7-432d-8309-80a7583d3601';

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Health',
  'Entertainment',
  'Travel',
  'Stay',
  'Subscriptions',
  'Other',
] as const;

export const EXPENSE_KINDS = ['Everyday', 'Travel', 'Receipt'] as const;

export const EXPENSE_PAYMENTS = ['UPI', 'Card', 'Cash', 'Other'] as const;

export const EXPENSE_STATUSES = ['Logged', 'Needs receipt', 'Submitted', 'Reimbursed'] as const;

export const EXPENSE_TRIPS = ['Vietnam Sep 2026', 'Varanasi Sep 2026', 'Other trip'] as const;

/** Wallet tagged on the spend. Distinct from Payment (instrument). */
export const EXPENSE_ACCOUNTS = ['Cash', 'UPI', 'Primary debit', 'Primary credit', 'Corporate'] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type ExpenseKind = (typeof EXPENSE_KINDS)[number];
export type ExpensePayment = (typeof EXPENSE_PAYMENTS)[number];
export type ExpenseStatus = (typeof EXPENSE_STATUSES)[number];
export type ExpenseTrip = (typeof EXPENSE_TRIPS)[number];
export type ExpenseAccount = (typeof EXPENSE_ACCOUNTS)[number];

/** Mapped expense row. Property names match the Notion schema 1:1. */
export interface NotionExpense {
  id: string;
  url: string;
  /** Name (title) */
  name: string;
  /** Amount (number, rupee). Null when Notion has no value. */
  amount: number | null;
  /** Date (date start, YYYY-MM-DD). */
  date: string | null;
  /** Category (select) */
  category: ExpenseCategory | null;
  /** Kind (select) */
  kind: ExpenseKind | null;
  /** Payment (select) */
  payment: ExpensePayment | null;
  /** Status (select) */
  status: ExpenseStatus | null;
  /** Trip (select) */
  trip: ExpenseTrip | null;
  /** Account (select): Cash, UPI, Primary debit, Primary credit, Corporate */
  account: ExpenseAccount | null;
  /** Notes (text) */
  notes: string;
  /** Receipt (url) */
  receipt: string | null;
  /** Reimbursable (checkbox) */
  reimbursable: boolean;
}

export interface BreakdownRow {
  key: string;
  total: number;
  count: number;
}

export interface MonthReport {
  monthKey: string;
  currency: 'INR';
  total: number;
  count: number;
  /** Rows with null Amount — shown as ₹— and excluded from totals. */
  unpricedCount: number;
  byCategory: BreakdownRow[];
  byKind: BreakdownRow[];
  byTrip: BreakdownRow[];
}

export type NotionExpensesSource = 'notion' | 'mock' | 'error';

export interface NotionExpensesSnapshot {
  source: NotionExpensesSource;
  expenses: NotionExpense[];
  report: MonthReport;
  warning?: string;
  error?: string;
}

/** Stub only — Expense Tracker owns writes. Do not call from the UI. */
export interface NotionExpenseWriteInput {
  name: string;
  amount: number;
  date: string;
  category?: ExpenseCategory;
  kind?: ExpenseKind;
  payment?: ExpensePayment;
  status?: ExpenseStatus;
  trip?: ExpenseTrip;
  account?: ExpenseAccount;
  notes?: string;
  receipt?: string | null;
  reimbursable?: boolean;
}
