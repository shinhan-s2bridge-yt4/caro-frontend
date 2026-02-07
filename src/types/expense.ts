export type ExpenseCategory = 'FUEL' | 'MAINTENANCE' | 'PARKING' | 'TOLL';

export type ExpenseCategoryItem = {
  category: ExpenseCategory;
  categoryLabel: string;
};

export type ExpenseMemberCar = {
  id: number;
  brandName: string;
  modelName: string;
  variant: string;
};

export type Expense = {
  id: number;
  expenseDate: string; // e.g. "2026-02-06"
  category: ExpenseCategory;
  categoryLabel: string;
  amount: number;
  location: string;
  memo: string;
  memberCar: ExpenseMemberCar;
};

export type ExpensesResponse = {
  totalCount: number;
  expenses: Expense[];
  nextCursor: string | null;
  hasNext: boolean;
};

export type ExpensesRequest = {
  yearMonth?: string; // e.g. "2026-02"
  date?: string; // e.g. "2026-02-06"
  category?: ExpenseCategory;
  cursor?: string;
  size?: number;
};

export type CreateExpenseRequest = {
  memberCarId: number;
  expenseDate: string; // e.g. "2026-02-06"
  amount: number;
  category: ExpenseCategory;
  location: string;
  memo: string;
};

export type CreateExpenseResponse = {
  id: number;
};

// GET /api/v1/expenses/summary 응답
export type ExpenseSummaryPeriod = {
  startDate: string; // e.g. "2026-02-07"
  endDate: string;
};

export type ExpenseSummaryComparison = {
  previousAmount: number;
  difference: number;
};

export type ExpenseSummaryTotalAmount = {
  amount: number;
  comparison: ExpenseSummaryComparison;
};

export type ExpenseSummaryCategoryItem = {
  category: string;
  categoryLabel: string;
  amount: number;
};

export type ExpenseSummary = {
  period: ExpenseSummaryPeriod;
  totalAmount: ExpenseSummaryTotalAmount;
  categories: ExpenseSummaryCategoryItem[];
};
