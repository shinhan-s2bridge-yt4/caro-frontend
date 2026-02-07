import { create } from 'zustand';

import { getExpenses, createExpense, getExpenseCategories, getExpenseSummary } from '@/services/expenseService';
import type { Expense, ExpenseCategory, CreateExpenseRequest, ExpenseCategoryItem, ExpenseSummary } from '@/types/expense';

type ExpenseState = {
  expenses: Expense[];
  totalCount: number;
  nextCursor: string | null;
  hasNext: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;

  // 생성 관련 상태
  isCreating: boolean;
  createError: string | null;

  // 카테고리 관련 상태
  categories: ExpenseCategoryItem[];
  isCategoriesLoading: boolean;
  categoriesError: string | null;

  // 요약 관련 상태
  summary: ExpenseSummary | null;
  isSummaryLoading: boolean;
  summaryError: string | null;

  fetchExpenses: (params: {
    accessToken: string;
    yearMonth?: string;
    date?: string;
    category?: ExpenseCategory;
    size?: number;
  }) => Promise<void>;

  fetchMoreExpenses: (params: {
    accessToken: string;
    yearMonth?: string;
    date?: string;
    category?: ExpenseCategory;
  }) => Promise<void>;

  createExpense: (params: {
    request: CreateExpenseRequest;
    accessToken: string;
  }) => Promise<boolean>;

  fetchCategories: (params: { accessToken: string }) => Promise<void>;

  fetchSummary: (params: {
    accessToken: string;
    yearMonth?: string;
  }) => Promise<void>;

  reset: () => void;
};

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  totalCount: 0,
  nextCursor: null,
  hasNext: false,
  isLoading: false,
  isLoadingMore: false,
  error: null,

  // 생성 관련 초기 상태
  isCreating: false,
  createError: null,

  // 카테고리 관련 초기 상태
  categories: [],
  isCategoriesLoading: false,
  categoriesError: null,

  // 요약 관련 초기 상태
  summary: null,
  isSummaryLoading: false,
  summaryError: null,

  fetchExpenses: async ({ accessToken, yearMonth, date, category, size }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getExpenses({
        request: {
          ...(yearMonth && { yearMonth }),
          ...(date && { date }),
          ...(category && { category }),
          ...(size && { size }),
        },
        accessToken,
      });
      set({
        expenses: response.expenses,
        totalCount: response.totalCount,
        nextCursor: response.nextCursor,
        hasNext: response.hasNext,
        isLoading: false,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : '지출 내역을 불러오는데 실패했습니다.';
      set({ error: message, isLoading: false });
    }
  },

  fetchMoreExpenses: async ({ accessToken, yearMonth, date, category }) => {
    const { nextCursor, hasNext, isLoadingMore } = get();
    if (!hasNext || isLoadingMore || !nextCursor) return;

    set({ isLoadingMore: true });
    try {
      const response = await getExpenses({
        request: {
          ...(yearMonth && { yearMonth }),
          ...(date && { date }),
          ...(category && { category }),
          cursor: nextCursor,
        },
        accessToken,
      });
      set((state) => ({
        expenses: [...state.expenses, ...response.expenses],
        nextCursor: response.nextCursor,
        hasNext: response.hasNext,
        isLoadingMore: false,
      }));
    } catch (e) {
      const message = e instanceof Error ? e.message : '추가 지출 내역을 불러오는데 실패했습니다.';
      set({ error: message, isLoadingMore: false });
    }
  },

  createExpense: async ({ request, accessToken }) => {
    set({ isCreating: true, createError: null });
    try {
      await createExpense({ request, accessToken });
      set({ isCreating: false });
      return true;
    } catch (e: unknown) {
      let message = '지출 내역 추가에 실패했습니다.';
      // axios 에러인 경우 서버 응답 메시지 추출
      if (e && typeof e === 'object' && 'response' in e) {
        const axiosError = e as { response?: { data?: { message?: string } } };
        message = axiosError.response?.data?.message || message;
      } else if (e instanceof Error) {
        message = e.message;
      }
      console.error('createExpense error:', e);
      set({ createError: message, isCreating: false });
      return false;
    }
  },

  fetchCategories: async ({ accessToken }) => {
    set({ isCategoriesLoading: true, categoriesError: null });
    try {
      const categories = await getExpenseCategories({ accessToken });
      set({ categories, isCategoriesLoading: false });
    } catch (e) {
      const message = e instanceof Error ? e.message : '카테고리 목록을 불러오는데 실패했습니다.';
      set({ categoriesError: message, isCategoriesLoading: false });
    }
  },

  fetchSummary: async ({ accessToken, yearMonth }) => {
    set({ isSummaryLoading: true, summaryError: null });
    try {
      const summary = await getExpenseSummary({
        accessToken,
        yearMonth,
      });
      set({ summary, isSummaryLoading: false });
    } catch (e) {
      const message = e instanceof Error ? e.message : '지출 요약을 불러오는데 실패했습니다.';
      set({ summaryError: message, isSummaryLoading: false });
    }
  },

  reset: () =>
    set({
      expenses: [],
      totalCount: 0,
      nextCursor: null,
      hasNext: false,
      isLoading: false,
      isLoadingMore: false,
      error: null,
      isCreating: false,
      createError: null,
      categories: [],
      isCategoriesLoading: false,
      categoriesError: null,
      summary: null,
      isSummaryLoading: false,
      summaryError: null,
    }),
}));
