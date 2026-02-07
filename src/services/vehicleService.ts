import axios from 'axios';

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

export async function registerMyCar(params: {
  payload: RegisterMyCarRequest;
  accessToken: string;
}): Promise<MyCar> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL 이 설정되어있지 않습니다.');
  }
  if (!params.accessToken) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  const { data } = await axios.post<ApiResponse<MyCar>>(
    `${baseUrl}/api/v1/cars`,
    params.payload,
    {
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
      },
    },
  );

  return data.data;
}

export async function fetchMyCars(accessToken: string): Promise<PrimaryCar[]> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL 이 설정되어있지 않습니다.');
  }
  if (!accessToken) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  const { data } = await axios.get<ApiResponse<PrimaryCar[]>>(
    `${baseUrl}/api/v1/cars`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return data.data ?? [];
}

