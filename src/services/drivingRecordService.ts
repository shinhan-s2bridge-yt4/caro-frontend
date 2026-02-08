import apiClient from '@/services/apiClient';

import type { ApiResponse } from '@/types/vehicle';
import type {
  DrivingRecordsRequest,
  DrivingRecordsResponse,
  DrivingSummary,
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
