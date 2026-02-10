import apiClient from '@/services/apiClient';

import type { ProfileResponse, ProfileData } from '@/types/profile';

// 마이페이지 대시보드
export type DashboardData = {
  totalDistanceKm: number;
  availablePoints: number;
  totalDrivingRecordCount: number;
};

type DashboardResponse = {
  code: string;
  message: string;
  data: DashboardData;
};

export async function fetchDashboard(): Promise<DashboardData> {
  const { data } = await apiClient.get<DashboardResponse>(
    '/api/v1/members/dashboard',
  );
  return data.data;
}

export async function fetchProfile(accessToken: string): Promise<ProfileData> {
  const { data } = await apiClient.get<ProfileResponse>(
    '/api/v1/profiles',
  );

  return data.data;
}

export interface UpdateProfileRequest {
  name?: string | null;
  car?: {
    id: number;
    registrationNumber: string;
  } | null;
}

export async function updateProfile(
  accessToken: string,
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

  const { data } = await apiClient.patch<ProfileResponse>(
    '/api/v1/profiles',
    body,
  );

  return data.data;
}
