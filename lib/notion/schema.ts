/**
 * Notion schema mirrors — Expenses, Accounts, Budgets.
 * Currency is INR (Notion number format: rupee).
 * Writes are owned by Expense Tracker. This app is read-only.
 *
 * Expenses: https://app.notion.com/p/76941781c8ef4d258923b9c2a6750292
 *   collection://b35c3e74-0bc7-432d-8309-80a7583d3601
 * Accounts: https://app.notion.com/p/a9effaa05c66492a9780b5a36cda1d63
 *   collection://2c0de472-1d21-4243-bcd8-1fb19ab89bba
 * Budgets: https://app.notion.com/p/301bb78c3c094fb1aee38bcb57f7beb0
 *   collection://3f8d31df-d13d-49a2-a9ac-f5b8489f737f
 */

export const NOTION_EXPENSES_DATABASE_ID = '76941781c8ef4d258923b9c2a6750292';
export const NOTION_EXPENSES_DATA_SOURCE_ID = 'b35c3e74-0bc7-432d-8309-80a7583d3601';

export const NOTION_ACCOUNTS_DATABASE_ID = 'a9effaa05c66492a9780b5a36cda1d63';
export const NOTION_ACCOUNTS_DATA_SOURCE_ID = '2c0de472-1d21-4243-bcd8-1fb19ab89bba';

export const NOTION_BUDGETS_DATABASE_ID = '301bb78c3c094fb1aee38bcb57f7beb0';
export const NOTION_BUDGETS_DATA_SOURCE_ID = '3f8d31df-d13d-49a2-a9ac-f5b8489f737f';

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

/** Accounts row. Name matches Expenses Account select. */
export interface NotionAccount {
  id: string;
  url: string;
  name: string;
  notes: string;
  /** Opening balance (number, rupee). Null when Notion has no value. */
  openingBalance: number | null;
}

/**
 * Per-account wallet: opening − tagged Expenses (priced Amounts only).
 * Primary credit may be negative (amount owed). Opening null is treated as 0 for math.
 */
export interface AccountBalance {
  id: string;
  url: string;
  name: string;
  notes: string;
  openingBalance: number | null;
  openingMissing: boolean;
  spent: number;
  expenseCount: number;
  balance: number;
}

/** Budgets row. Category enums match Expenses. */
export interface NotionBudget {
  id: string;
  url: string;
  name: string;
  category: ExpenseCategory | null;
  monthlyCap: number | null;
  notes: string;
}

/** Monthly cap − this-month spend in that Category. */
export interface BudgetProgress {
  id: string;
  url: string;
  name: string;
  category: ExpenseCategory | null;
  notes: string;
  monthlyCap: number | null;
  capMissing: boolean;
  spent: number;
  expenseCount: number;
  /** Null when the cap is missing. */
  left: number | null;
  over: boolean;
  /** spent / cap, or null when cap is missing or 0. */
  pct: number | null;
  monthKey: string;
}

export type NotionMoneySource = 'notion' | 'mock' | 'error';

export interface NotionAccountsSnapshot {
  source: NotionMoneySource;
  accounts: NotionAccount[];
  balances: AccountBalance[];
  warning?: string;
  error?: string;
}

export interface NotionBudgetsSnapshot {
  source: NotionMoneySource;
  budgets: NotionBudget[];
  progress: BudgetProgress[];
  monthKey: string;
  warning?: string;
  error?: string;
}
