import axios from 'axios';

import type { ApiResponse } from '@/types/vehicle';
import type {
  ExpensesRequest,
  ExpensesResponse,
  CreateExpenseRequest,
  CreateExpenseResponse,
  ExpenseCategoryItem,
} from '@/types/expense';

function getApiBaseUrl() {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
  return base.replace(/\/+$/, '');
}

export async function getExpenses(params: {
  request: ExpensesRequest;
  accessToken: string;
}): Promise<ExpensesResponse> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL 이 설정되어있지 않습니다.');
  }
  if (!params.accessToken) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  const { data } = await axios.get<ApiResponse<ExpensesResponse>>(
    `${baseUrl}/api/v1/expenses`,
    {
      params: {
        ...(params.request.yearMonth && { yearMonth: params.request.yearMonth }),
        ...(params.request.date && { date: params.request.date }),
        ...(params.request.category && { category: params.request.category }),
        ...(params.request.cursor && { cursor: params.request.cursor }),
        size: params.request.size ?? 20,
      },
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
      },
    },
  );

  return data.data;
}

export async function createExpense(params: {
  request: CreateExpenseRequest;
  accessToken: string;
}): Promise<CreateExpenseResponse> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL 이 설정되어있지 않습니다.');
  }
  if (!params.accessToken) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  const { data } = await axios.post<ApiResponse<CreateExpenseResponse>>(
    `${baseUrl}/api/v1/expenses`,
    params.request,
    {
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );

  return data.data;
}

export async function getExpenseCategories(params: {
  accessToken: string;
}): Promise<ExpenseCategoryItem[]> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL 이 설정되어있지 않습니다.');
  }
  if (!params.accessToken) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  const { data } = await axios.get<ApiResponse<ExpenseCategoryItem[]>>(
    `${baseUrl}/api/v1/expenses/categories`,
    {
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
      },
    },
  );

  return data.data;
}
