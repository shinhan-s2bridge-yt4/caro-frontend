import axios from 'axios';

import type { ApiResponse } from '@/types/vehicle';
import type {
  DrivingRecordsRequest,
  DrivingRecordsResponse,
  DrivingSummary,
} from '@/types/drivingRecord';

function getApiBaseUrl() {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
  return base.replace(/\/+$/, '');
}

export async function getDrivingRecords(params: {
  request: DrivingRecordsRequest;
  accessToken: string;
}): Promise<DrivingRecordsResponse> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL 이 설정되어있지 않습니다.');
  }
  if (!params.accessToken) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  const { data } = await axios.get<ApiResponse<DrivingRecordsResponse>>(
    `${baseUrl}/api/v1/driving-records`,
    {
      params: {
        ...(params.request.yearMonth && { yearMonth: params.request.yearMonth }),
        ...(params.request.cursor !== undefined && { cursor: params.request.cursor }),
        size: params.request.size ?? 10,
      },
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
      },
    },
  );

  return data.data;
}

export async function getDrivingSummary(params: {
  accessToken: string;
}): Promise<DrivingSummary> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL 이 설정되어있지 않습니다.');
  }
  if (!params.accessToken) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  const { data } = await axios.get<ApiResponse<DrivingSummary>>(
    `${baseUrl}/api/v1/driving-records/summary`,
    {
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
      },
    },
  );

  return data.data;
}
