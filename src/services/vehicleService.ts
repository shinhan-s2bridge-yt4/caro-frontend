import axios from 'axios';
import apiClient from '@/services/apiClient';
import type { ApiEnvelope } from '@/services/apiResponse';
import { getApiData } from '@/services/apiResponse';

import type {
  MyCar,
  RegisterMyCarRequest,
  VehicleBrand,
  VehicleModel,
} from '@/types/vehicle';
import type { PrimaryCar } from '@/types/profile';
import { requireApiBaseUrl } from '@/utils/api';

// 인증 불필요 — 일반 axios 사용
export async function getVehicleBrands(): Promise<VehicleBrand[]> {
  const baseUrl = requireApiBaseUrl();

  const response = await axios.get<ApiEnvelope<VehicleBrand[]>>(
    `${baseUrl}/api/v1/vehicles/brands`,
  );
  return getApiData(response) ?? [];
}

// 인증 불필요 — 일반 axios 사용
export async function getVehicleModels(params: {
  brandId: number;
  keyword?: string;
}): Promise<VehicleModel[]> {
  const baseUrl = requireApiBaseUrl();

  const response = await axios.get<ApiEnvelope<VehicleModel[]>>(
    `${baseUrl}/api/v1/vehicles/brands/${params.brandId}/models`,
    {
      params: params.keyword ? { keyword: params.keyword } : undefined,
    },
  );
  return getApiData(response) ?? [];
}

// 인증 필요 — apiClient 사용
export async function registerMyCar(params: {
  payload: RegisterMyCarRequest;
}): Promise<MyCar> {
  const response = await apiClient.post<ApiEnvelope<MyCar>>(
    '/api/v1/cars',
    params.payload,
  );

  return getApiData(response);
}

// 인증 필요 — apiClient 사용
export async function fetchMyCars(): Promise<PrimaryCar[]> {
  const response = await apiClient.get<ApiEnvelope<PrimaryCar[]>>(
    '/api/v1/cars',
  );

  return getApiData(response) ?? [];
}

// 인증 필요 — apiClient 사용
export async function setPrimaryCar(memberCarId: number): Promise<string> {
  const response = await apiClient.patch<ApiEnvelope<string>>(
    `/api/v1/cars/${memberCarId}/primary`,
  );
  return getApiData(response);
}

// 인증 필요 — apiClient 사용
export async function deleteMyCar(memberCarId: number): Promise<void> {
  await apiClient.delete(`/api/v1/cars/${memberCarId}`);
}
