import apiClient from '@/services/apiClient';
import type { ApiEnvelope } from '@/services/apiResponse';
import { getApiData } from '@/services/apiResponse';

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
}): Promise<ExpensesResponse> {
  const response = await apiClient.get<ApiEnvelope<ExpensesResponse>>(
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

  return getApiData(response);
}

export async function createExpense(params: {
  request: CreateExpenseRequest;
}): Promise<CreateExpenseResponse> {
  const response = await apiClient.post<ApiEnvelope<CreateExpenseResponse>>(
    '/api/v1/expenses',
    params.request,
  );

  return getApiData(response);
}

export async function updateExpense(params: {
  expenseId: number;
  request: UpdateExpenseRequest;
}): Promise<UpdateExpenseResponse> {
  const response = await apiClient.put<ApiEnvelope<UpdateExpenseResponse>>(
    `/api/v1/expenses/${params.expenseId}`,
    params.request,
  );

  return getApiData(response);
}

export async function getExpenseSummary(params: {
  yearMonth?: string;
}): Promise<ExpenseSummary> {
  const response = await apiClient.get<ApiEnvelope<ExpenseSummary>>(
    '/api/v1/expenses/summary',
    {
      params: {
        ...(params.yearMonth && { yearMonth: params.yearMonth }),
      },
    },
  );

  return getApiData(response);
}

export async function getExpenseCategories(): Promise<ExpenseCategoryItem[]> {
  const response = await apiClient.get<ApiEnvelope<ExpenseCategoryItem[]>>(
    '/api/v1/expenses/categories',
  );

  return getApiData(response);
}
