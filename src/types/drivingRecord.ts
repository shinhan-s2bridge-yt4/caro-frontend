export type DrivingRecord = {
  id: number;
  driveDate: string;
  startTime: string;
  endTime: string;
  distanceKm: string;
  startLocation: string;
  endLocation: string;
  vehicleModelName: string;
  vehicleVariantName: string;
  earnedPoints: number;
};

export type DrivingRecordsResponse = {
  records: DrivingRecord[];
  nextCursor: number | null;
  hasNext: boolean;
};

export type DrivingRecordsRequest = {
  yearMonth?: string; // e.g. "2026-02" (optional)
  cursor?: number;
  size?: number;
};

export type DrivingSummary = {
  totalDistanceKm: number;
  totalEarnedPoints: number;
  totalDrivingCount: number;
};
