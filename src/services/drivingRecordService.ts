import apiClient from '@/services/apiClient';

import type { ApiResponse } from '@/types/vehicle';
import type {
  DrivingRecordsRequest,
  DrivingRecordsResponse,
  DrivingRecordDetailResponse,
  DrivingSummary,
  TodayDrivingRecordsResponse,
  CreateDrivingRecordRequest,
  CreateDrivingRecordResponse,
} from '@/types/drivingRecord';

export async function getDrivingRecords(params: {
  request: DrivingRecordsRequest;
  accessToken: string;
}): Promise<DrivingRecordsResponse> {
  const { data } = await apiClient.get<ApiResponse<DrivingRecordsResponse>>(
    '/api/v1/driving-records',
    {
      params: {
        ...(params.request.yearMonth && { yearMonth: params.request.yearMonth }),
        ...(params.request.cursor !== undefined && { cursor: params.request.cursor }),
        size: params.request.size ?? 10,
      },
    },
  );

  return data.data;
}

export async function getDrivingSummary(params: {
  accessToken: string;
}): Promise<DrivingSummary> {
  const { data } = await apiClient.get<ApiResponse<DrivingSummary>>(
    '/api/v1/driving-records/summary',
  );

  return data.data;
}

export async function getTodayDrivingRecords(): Promise<TodayDrivingRecordsResponse> {
  const { data } = await apiClient.get<ApiResponse<TodayDrivingRecordsResponse>>(
    '/api/v1/driving-records/today',
  );

  return data.data;
}

export async function getDrivingRecordDetail(
  drivingRecordId: number,
): Promise<DrivingRecordDetailResponse> {
  const { data } = await apiClient.get<ApiResponse<DrivingRecordDetailResponse>>(
    `/api/v1/driving-records/${drivingRecordId}`,
  );

  return data.data;
}

export async function createDrivingRecord(params: {
  request: CreateDrivingRecordRequest;
  accessToken: string;
}): Promise<CreateDrivingRecordResponse> {
  const { data } = await apiClient.post<ApiResponse<CreateDrivingRecordResponse>>(
    '/api/v1/driving-records',
    params.request,
  );

  return data.data;
}
