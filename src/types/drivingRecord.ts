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

export type CreateDrivingRecordRequest = {
  memberCarId: number;
  startDateTime: string; // ISO 8601, e.g. "2026-02-08T15:17:52.357Z"
  endDateTime: string;   // ISO 8601, e.g. "2026-02-08T15:17:52.357Z"
  distanceKm: number;
  startLocation: string;
  endLocation: string;
};

export type CreateDrivingRecordResponse = {
  id: number;
  pendingPoints: number;
};
