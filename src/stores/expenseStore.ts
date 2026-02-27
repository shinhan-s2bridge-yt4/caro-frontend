import { create } from 'zustand';

import {
  getExpenses,
  createExpense as createExpenseApi,
  updateExpense as updateExpenseApi,
  getExpenseCategories,
  getExpenseSummary,
} from '@/services/expenseService';
import type { Expense, ExpenseCategory, CreateExpenseRequest, UpdateExpenseRequest, ExpenseCategoryItem, ExpenseSummary } from '@/types/expense';
import { getErrorMessage } from '@/utils/error';

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

  // 수정 관련 상태
  isUpdating: boolean;
  updateError: string | null;

  // 카테고리 관련 상태
  categories: ExpenseCategoryItem[];
  isCategoriesLoading: boolean;
  categoriesError: string | null;

  // 요약 관련 상태
  summary: ExpenseSummary | null;
  isSummaryLoading: boolean;
  summaryError: string | null;

  fetchExpenses: (params: {
    yearMonth?: string;
    date?: string;
    category?: ExpenseCategory;
    size?: number;
  }) => Promise<void>;

  fetchMoreExpenses: (params: {
    yearMonth?: string;
    date?: string;
    category?: ExpenseCategory;
  }) => Promise<void>;

  createExpense: (params: {
    request: CreateExpenseRequest;
  }) => Promise<boolean>;

  updateExpense: (params: {
    expenseId: number;
    request: UpdateExpenseRequest;
  }) => Promise<boolean>;

  fetchCategories: () => Promise<void>;

  fetchSummary: (params: {
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

  // 수정 관련 초기 상태
  isUpdating: false,
  updateError: null,

  // 카테고리 관련 초기 상태
  categories: [],
  isCategoriesLoading: false,
  categoriesError: null,

  // 요약 관련 초기 상태
  summary: null,
  isSummaryLoading: false,
  summaryError: null,

  fetchExpenses: async ({ yearMonth, date, category, size }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getExpenses({
        request: {
          ...(yearMonth && { yearMonth }),
          ...(date && { date }),
          ...(category && { category }),
          ...(size && { size }),
        },
      });
      set({
        expenses: response.expenses,
        totalCount: response.totalCount,
        nextCursor: response.nextCursor,
        hasNext: response.hasNext,
        isLoading: false,
      });
    } catch (e) {
      const message = getErrorMessage(e, '지출 내역을 불러오는데 실패했습니다.');
      set({ error: message, isLoading: false });
    }
  },

  fetchMoreExpenses: async ({ yearMonth, date, category }) => {
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
      });
      set((state) => ({
        expenses: [...state.expenses, ...response.expenses],
        nextCursor: response.nextCursor,
        hasNext: response.hasNext,
        isLoadingMore: false,
      }));
    } catch (e) {
      const message = getErrorMessage(e, '추가 지출 내역을 불러오는데 실패했습니다.');
      set({ error: message, isLoadingMore: false });
    }
  },

  createExpense: async ({ request }) => {
    set({ isCreating: true, createError: null });
    try {
      await createExpenseApi({ request });
      set({ isCreating: false });
      return true;
    } catch (e: unknown) {
      const message = getErrorMessage(e, '지출 내역 추가에 실패했습니다.');
      console.error('createExpense error:', e);
      set({ createError: message, isCreating: false });
      return false;
    }
  },

  updateExpense: async ({ expenseId, request }) => {
    set({ isUpdating: true, updateError: null });
    try {
      await updateExpenseApi({ expenseId, request });
      set({ isUpdating: false });
      return true;
    } catch (e: unknown) {
      const message = getErrorMessage(e, '지출 내역 수정에 실패했습니다.');
      console.error('updateExpense error:', e);
      set({ updateError: message, isUpdating: false });
      return false;
    }
  },

  fetchCategories: async () => {
    set({ isCategoriesLoading: true, categoriesError: null });
    try {
      const categories = await getExpenseCategories();
      set({ categories, isCategoriesLoading: false });
    } catch (e) {
      const message = getErrorMessage(e, '카테고리 목록을 불러오는데 실패했습니다.');
      set({ categoriesError: message, isCategoriesLoading: false });
    }
  },

  fetchSummary: async ({ yearMonth }) => {
    set({ isSummaryLoading: true, summaryError: null });
    try {
      const summary = await getExpenseSummary({ yearMonth });
      set({ summary, isSummaryLoading: false });
    } catch (e) {
      const message = getErrorMessage(e, '지출 요약을 불러오는데 실패했습니다.');
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
      isUpdating: false,
      updateError: null,
      categories: [],
      isCategoriesLoading: false,
      categoriesError: null,
      summary: null,
      isSummaryLoading: false,
      summaryError: null,
    }),
}));
