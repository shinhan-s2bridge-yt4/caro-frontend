import { create } from 'zustand';

export type DrivingStatus = 'idle' | 'driving' | 'paused';

export interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface DrivingState {
  // 운행 상태
  status: DrivingStatus;
  
  // 블루투스 연결 상태
  isBluetoothConnected: boolean;
  connectedDeviceName: string | null;
  
  // 운행 데이터
  startTime: number | null;
  elapsedSeconds: number;
  totalDistanceKm: number;
  
  // GPS 위치 기록
  locations: LocationPoint[];
  currentLocation: LocationPoint | null;
  
  // 액션
  setBluetoothConnected: (connected: boolean, deviceName?: string | null) => void;
  startDriving: () => void;
  stopDriving: () => void;
  pauseDriving: () => void;
  resumeDriving: () => void;
  updateLocation: (location: LocationPoint) => void;
  addDistance: (distanceKm: number) => void;
  incrementElapsedTime: () => void;
  reset: () => void;
}

// Haversine 공식으로 두 좌표 사이의 거리 계산 (km)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const useDrivingStore = create<DrivingState>((set, get) => ({
  // 초기 상태
  status: 'idle',
  isBluetoothConnected: false,
  connectedDeviceName: null,
  startTime: null,
  elapsedSeconds: 0,
  totalDistanceKm: 0,
  locations: [],
  currentLocation: null,

  // 블루투스 연결 상태 업데이트
  setBluetoothConnected: (connected, deviceName = null) => {
    set({ isBluetoothConnected: connected, connectedDeviceName: deviceName });
    
    // 블루투스 연결 시 자동으로 운행 시작
    if (connected && get().status === 'idle') {
      get().startDriving();
    }
    
    // 블루투스 연결 해제 시 운행 중지
    if (!connected && get().status === 'driving') {
      get().stopDriving();
    }
  },

  // 운행 시작
  startDriving: () => {
    set({
      status: 'driving',
      startTime: Date.now(),
      elapsedSeconds: 0,
      totalDistanceKm: 0,
      locations: [],
    });
  },

  // 운행 중지
  stopDriving: () => {
    set({
      status: 'idle',
    });
  },

  // 운행 일시정지
  pauseDriving: () => {
    set({ status: 'paused' });
  },

  // 운행 재개
  resumeDriving: () => {
    set({ status: 'driving' });
  },

  // 위치 업데이트 및 거리 계산
  updateLocation: (location) => {
    const { currentLocation, status } = get();
    
    if (status !== 'driving') {
      set({ currentLocation: location });
      return;
    }

    // 이전 위치가 있으면 거리 계산
    if (currentLocation) {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        location.latitude,
        location.longitude
      );
      
      // 최소 이동 거리 필터링 (GPS 오차 제거, 5m 이상일 때만)
      if (distance >= 0.005) {
        set((state) => ({
          totalDistanceKm: state.totalDistanceKm + distance,
          locations: [...state.locations, location],
          currentLocation: location,
        }));
        return;
      }
    }

    set((state) => ({
      locations: state.locations.length === 0 ? [location] : state.locations,
      currentLocation: location,
    }));
  },

  // 직접 거리 추가 (외부에서 계산된 경우)
  addDistance: (distanceKm) => {
    set((state) => ({
      totalDistanceKm: state.totalDistanceKm + distanceKm,
    }));
  },

  // 경과 시간 증가 (1초씩)
  incrementElapsedTime: () => {
    set((state) => ({
      elapsedSeconds: state.elapsedSeconds + 1,
    }));
  },

  // 초기화
  reset: () => {
    set({
      status: 'idle',
      startTime: null,
      elapsedSeconds: 0,
      totalDistanceKm: 0,
      locations: [],
      currentLocation: null,
    });
  },
}));

// 시간 포맷팅 유틸리티 (HH:MM:SS)
export function formatElapsedTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return [hours, minutes, secs]
    .map((v) => String(v).padStart(2, '0'))
    .join(':');
}

// 거리 포맷팅 유틸리티
export function formatDistance(km: number): string {
  if (km < 0.1) {
    return (km * 1000).toFixed(0);
  }
  return km.toFixed(1);
}
