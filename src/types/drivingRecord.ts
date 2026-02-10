export type DrivingRecord = {
  id: number;
  startDateTime: string; // ISO 8601, e.g. "2026-02-08T15:20:47.172Z"
  endDateTime: string;   // ISO 8601, e.g. "2026-02-08T15:20:47.172Z"
  distanceKm: number;
  startLocation: string;
  endLocation: string;
  vehicleBrandName: string;
  vehicleModelName: string;
  vehicleVariantName: string;
  earnedPoints: number;
};

export type DrivingRecordsResponse = {
  records: DrivingRecord[];
  nextCursor: number | null;
  hasNext: boolean;
  monthlyCount: number;
};

export type DrivingRecordsRequest = {
  yearMonth?: string; // e.g. "2026-02" (optional)
  cursor?: number;
  size?: number;
};

export type DrivingSummary = {
  totalDistanceKm: number;
  totalEarnedPoints: number;
};

export type TodayDrivingRecordsResponse = {
  records: DrivingRecord[];
  totalCount: number;
};

export type RouteCoordinate = {
  lat: number;
  lng: number;
  t: number; // Unix timestamp (ms)
};

export type CreateDrivingRecordRequest = {
  memberCarId: number;
  startDateTime: string; // ISO 8601, e.g. "2026-02-08T15:17:52.357Z"
  endDateTime: string;   // ISO 8601, e.g. "2026-02-08T15:17:52.357Z"
  distanceKm: number;
  startLocation: string;
  endLocation: string;
  routeCoordinates?: RouteCoordinate[]; // GPS 경로 좌표 (로컬 영속화 후 전송)
};

export type CreateDrivingRecordResponse = {
  id: number;
  pendingPoints: number;
};
