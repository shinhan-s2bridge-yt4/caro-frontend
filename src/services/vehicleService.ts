import axios from 'axios';
import apiClient from '@/services/apiClient';

import type {
  ApiResponse,
  MyCar,
  RegisterMyCarRequest,
  VehicleBrand,
  VehicleModel,
} from '@/types/vehicle';
import type { PrimaryCar } from '@/types/profile';

function getApiBaseUrl() {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
  return base.replace(/\/+$/, '');
}

// 인증 불필요 — 일반 axios 사용
export async function getVehicleBrands(): Promise<VehicleBrand[]> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL 이 설정되어있지 않습니다.');
  }

  const { data } = await axios.get<ApiResponse<VehicleBrand[]>>(
    `${baseUrl}/api/v1/vehicles/brands`,
  );
  return data.data ?? [];
}

// 인증 불필요 — 일반 axios 사용
export async function getVehicleModels(params: {
  brandId: number;
  keyword?: string;
}): Promise<VehicleModel[]> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL 이 설정되어있지 않습니다.');
  }

  const { data } = await axios.get<ApiResponse<VehicleModel[]>>(
    `${baseUrl}/api/v1/vehicles/brands/${params.brandId}/models`,
    {
      params: params.keyword ? { keyword: params.keyword } : undefined,
    },
  );
  return data.data ?? [];
}

// 인증 필요 — apiClient 사용
export async function registerMyCar(params: {
  payload: RegisterMyCarRequest;
  accessToken: string;
}): Promise<MyCar> {
  const { data } = await apiClient.post<ApiResponse<MyCar>>(
    '/api/v1/cars',
    params.payload,
  );

  return data.data;
}

// 인증 필요 — apiClient 사용
export async function fetchMyCars(accessToken: string): Promise<PrimaryCar[]> {
  const { data } = await apiClient.get<ApiResponse<PrimaryCar[]>>(
    '/api/v1/cars',
  );

  return data.data ?? [];
}

// 인증 필요 — apiClient 사용
export async function setPrimaryCar(memberCarId: number): Promise<string> {
  const { data } = await apiClient.patch<ApiResponse<string>>(
    `/api/v1/cars/${memberCarId}/primary`,
  );
  return data.data;
}

// 인증 필요 — apiClient 사용
export async function deleteMyCar(memberCarId: number): Promise<void> {
  await apiClient.delete(`/api/v1/cars/${memberCarId}`);
}
