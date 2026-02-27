import apiClient from '@/services/apiClient';
import type { ApiEnvelope } from '@/services/apiResponse';
import { getApiData } from '@/services/apiResponse';

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
}): Promise<DrivingRecordsResponse> {
  const response = await apiClient.get<ApiEnvelope<DrivingRecordsResponse>>(
    '/api/v1/driving-records',
    {
      params: {
        ...(params.request.yearMonth && { yearMonth: params.request.yearMonth }),
        ...(params.request.cursor !== undefined && { cursor: params.request.cursor }),
        size: params.request.size ?? 10,
      },
    },
  );

  return getApiData(response);
}

export async function getDrivingSummary(): Promise<DrivingSummary> {
  const response = await apiClient.get<ApiEnvelope<DrivingSummary>>(
    '/api/v1/driving-records/summary',
  );

  return getApiData(response);
}

export async function getTodayDrivingRecords(): Promise<TodayDrivingRecordsResponse> {
  const response = await apiClient.get<ApiEnvelope<TodayDrivingRecordsResponse>>(
    '/api/v1/driving-records/today',
  );

  return getApiData(response);
}

export async function getDrivingRecordDetail(
  drivingRecordId: number,
): Promise<DrivingRecordDetailResponse> {
  const response = await apiClient.get<ApiEnvelope<DrivingRecordDetailResponse>>(
    `/api/v1/driving-records/${drivingRecordId}`,
  );

  return getApiData(response);
}

export async function createDrivingRecord(params: {
  request: CreateDrivingRecordRequest;
}): Promise<CreateDrivingRecordResponse> {
  const response = await apiClient.post<ApiEnvelope<CreateDrivingRecordResponse>>(
    '/api/v1/driving-records',
    params.request,
  );

  return getApiData(response);
}
