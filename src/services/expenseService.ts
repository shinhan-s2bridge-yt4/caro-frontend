import apiClient from '@/services/apiClient';

import type { ApiResponse } from '@/types/vehicle';
import type {
  ExpensesRequest,
  ExpensesResponse,
  CreateExpenseRequest,
  CreateExpenseResponse,
  UpdateExpenseRequest,
  UpdateExpenseResponse,
  ExpenseCategoryItem,
  ExpenseSummary,
} from '@/types/expense';

export async function getExpenses(params: {
  request: ExpensesRequest;
  accessToken: string;
}): Promise<ExpensesResponse> {
  const { data } = await apiClient.get<ApiResponse<ExpensesResponse>>(
    '/api/v1/expenses',
    {
      params: {
        ...(params.request.yearMonth && { yearMonth: params.request.yearMonth }),
        ...(params.request.date && { date: params.request.date }),
        ...(params.request.category && { category: params.request.category }),
        ...(params.request.cursor && { cursor: params.request.cursor }),
        size: params.request.size ?? 20,
      },
    },
  );

  return data.data;
}

export async function createExpense(params: {
  request: CreateExpenseRequest;
  accessToken: string;
}): Promise<CreateExpenseResponse> {
  const { data } = await apiClient.post<ApiResponse<CreateExpenseResponse>>(
    '/api/v1/expenses',
    params.request,
  );

  return data.data;
}

export async function updateExpense(params: {
  expenseId: number;
  request: UpdateExpenseRequest;
  accessToken: string;
}): Promise<UpdateExpenseResponse> {
  const { data } = await apiClient.put<ApiResponse<UpdateExpenseResponse>>(
    `/api/v1/expenses/${params.expenseId}`,
    params.request,
  );

  return data.data;
}

export async function getExpenseSummary(params: {
  yearMonth?: string;
  accessToken: string;
}): Promise<ExpenseSummary> {
  const { data } = await apiClient.get<ApiResponse<ExpenseSummary>>(
    '/api/v1/expenses/summary',
    {
      params: {
        ...(params.yearMonth && { yearMonth: params.yearMonth }),
      },
    },
  );

  return data.data;
}

export async function getExpenseCategories(params: {
  accessToken: string;
}): Promise<ExpenseCategoryItem[]> {
  const { data } = await apiClient.get<ApiResponse<ExpenseCategoryItem[]>>(
    '/api/v1/expenses/categories',
  );

  return data.data;
}
