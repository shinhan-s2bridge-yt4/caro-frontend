import axios from 'axios';

import type { ProfileResponse, ProfileData } from '@/types/profile';

function getApiBaseUrl() {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
  return base.replace(/\/+$/, '');
}

export async function fetchProfile(accessToken: string): Promise<ProfileData> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL 이 설정되어있지 않습니다.');
  }
  if (!accessToken) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  const { data } = await axios.get<ProfileResponse>(
    `${baseUrl}/api/v1/profiles`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
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
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL 이 설정되어있지 않습니다.');
  }
  if (!accessToken) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  // 수정하려는 필드만 포함, 유지하려는 필드는 제외
  const body: Record<string, unknown> = {};
  if (request.name !== undefined && request.name !== null) {
    body.name = request.name;
  }
  if (request.car !== undefined && request.car !== null) {
    body.car = request.car;
  }

  const { data } = await axios.patch<ProfileResponse>(
    `${baseUrl}/api/v1/profiles`,
    body,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return data.data;
}
