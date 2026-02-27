import apiClient from '@/services/apiClient';
import type { ApiEnvelope } from '@/services/apiResponse';
import { getApiData } from '@/services/apiResponse';

import type { ProfileData } from '@/types/profile';

// 마이페이지 대시보드
export type DashboardData = {
  totalDistanceKm: number;
  availablePoints: number;
  totalDrivingRecordCount: number;
};

export async function fetchDashboard(): Promise<DashboardData> {
  const response = await apiClient.get<ApiEnvelope<DashboardData>>(
    '/api/v1/members/dashboard',
  );
  return getApiData(response);
}

export async function fetchProfile(): Promise<ProfileData> {
  const response = await apiClient.get<ApiEnvelope<ProfileData>>(
    '/api/v1/profiles',
  );

  return getApiData(response);
}

export interface UpdateProfileRequest {
  name?: string | null;
  car?: {
    id: number;
    registrationNumber: string;
  } | null;
}

export async function updateProfile(
  request: UpdateProfileRequest,
): Promise<ProfileData> {
  // 수정하려는 필드만 포함, 유지하려는 필드는 제외
  const body: Record<string, unknown> = {};
  if (request.name !== undefined && request.name !== null) {
    body.name = request.name;
  }
  if (request.car !== undefined && request.car !== null) {
    body.car = request.car;
  }

  const response = await apiClient.patch<ApiEnvelope<ProfileData>>(
    '/api/v1/profiles',
    body,
  );

  return getApiData(response);
}
