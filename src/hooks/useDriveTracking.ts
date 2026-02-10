import { useEffect, useRef, useCallback, useState } from 'react';
import { Platform } from 'react-native';
import { useDrivingStore, type LocationPoint } from '@/stores/drivingStore';

// 네이티브 전용 모듈 - 웹에서는 import하지 않음
let Location: any = null;
let TaskManager: any = null;

if (Platform.OS !== 'web') {
  Location = require('expo-location');
  TaskManager = require('expo-task-manager');
}

const BACKGROUND_LOCATION_TASK = 'background-location-task';

// 좌표를 주소 문자열로 변환하는 역지오코딩 유틸리티
export async function reverseGeocodeToAddress(
  latitude: number,
  longitude: number,
): Promise<string> {
  if (Platform.OS === 'web' || !Location) return '알 수 없는 위치';
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results.length > 0) {
      const addr = results[0];
      // 한국 주소 형식: 시/도 + 구/군 + 동/읍/면 + 도로명
      const parts = [
        addr.region,       // 시/도
        addr.city,         // 시/군/구
        addr.district,     // 구/동
        addr.street,       // 도로명
        addr.name,         // 상세 주소
      ].filter(Boolean);

      // 중복 제거 후 합치기
      const unique = [...new Set(parts)];
      return unique.join(' ') || '알 수 없는 위치';
    }
    return '알 수 없는 위치';
  } catch {
    return '알 수 없는 위치';
  }
}

// 백그라운드 위치 추적 태스크 정의 (네이티브 전용)
if (Platform.OS !== 'web' && TaskManager && Location) {
  TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }: any) => {
    if (error) {
      console.error('백그라운드 위치 추적 에러:', error);
      return;
    }
    
    if (data) {
      const { locations } = data as { locations: any[] };
      const location = locations[0];
      
      if (location) {
        const { updateLocation } = useDrivingStore.getState();
        updateLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: location.timestamp,
        });
      }
    }
  });
}

interface UseDriveTrackingOptions {
  // GPS 정확도 설정
  accuracy?: number;
  // 위치 업데이트 간격 (ms)
  updateInterval?: number;
  // 최소 이동 거리 (m) - 이 거리 이상 이동해야 업데이트
  distanceFilter?: number;
  // 백그라운드 추적 활성화 여부
  enableBackground?: boolean;
}

interface UseDriveTrackingReturn {
  // 상태
  hasPermission: boolean;
  isTracking: boolean;
  currentLocation: LocationPoint | null;
  error: string | null;
  
  // 액션
  requestPermissions: () => Promise<boolean>;
  startTracking: () => Promise<void>;
  stopTracking: () => Promise<void>;
}

const WEB_NOOP_RETURN: UseDriveTrackingReturn = {
  hasPermission: false,
  isTracking: false,
  currentLocation: null,
  error: '웹에서는 GPS 추적을 지원하지 않습니다.',
  requestPermissions: async () => false,
  startTracking: async () => {},
  stopTracking: async () => {},
};

export function useDriveTracking(
  options: UseDriveTrackingOptions = {}
): UseDriveTrackingReturn {
  // 웹에서는 GPS 추적 기능 사용 불가 - 안전한 기본값 반환
  if (Platform.OS === 'web') return WEB_NOOP_RETURN;

  const {
    accuracy = Location?.Accuracy?.High ?? 4,
    updateInterval = 3000,
    distanceFilter = 5,
    enableBackground = true,
  } = options;

  const [hasPermission, setHasPermission] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const locationSubscriptionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const status = useDrivingStore((state) => state.status);
  const currentLocation = useDrivingStore((state) => state.currentLocation);
  const updateLocation = useDrivingStore((state) => state.updateLocation);
  const incrementElapsedTime = useDrivingStore((state) => state.incrementElapsedTime);
  const setStartLocationName = useDrivingStore((state) => state.setStartLocationName);

  // 위치 권한 요청
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      // Foreground 권한 요청
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        setError('위치 권한이 필요합니다.');
        setHasPermission(false);
        return false;
      }

      // Background 권한 요청 (필요시)
      if (enableBackground) {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        
        if (backgroundStatus !== 'granted') {
          console.warn('백그라운드 위치 권한이 거부되었습니다. 앱이 활성 상태일 때만 추적됩니다.');
        }
      }

      setHasPermission(true);
      setError(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '권한 요청 실패');
      setHasPermission(false);
      return false;
    }
  }, [enableBackground]);

  // 위치 추적 시작
  const startTracking = useCallback(async () => {
    if (isTracking) return;

    try {
      // 권한 확인
      if (!hasPermission) {
        const granted = await requestPermissions();
        if (!granted) return;
      }

      setIsTracking(true);
      setError(null);

      // 시작 위치 저장 (역지오코딩)
      try {
        const initialLocation = await Location.getCurrentPositionAsync({ accuracy });
        const startAddr = await reverseGeocodeToAddress(
          initialLocation.coords.latitude,
          initialLocation.coords.longitude,
        );
        setStartLocationName(startAddr);
        updateLocation({
          latitude: initialLocation.coords.latitude,
          longitude: initialLocation.coords.longitude,
          timestamp: initialLocation.timestamp,
        });
      } catch (err) {
        console.warn('시작 위치 역지오코딩 실패:', err);
      }

      // Foreground 위치 추적
      locationSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy,
          timeInterval: updateInterval,
          distanceInterval: distanceFilter,
        },
        (location: any) => {
          updateLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp,
          });
        }
      );

      // 백그라운드 위치 추적 시작
      if (enableBackground) {
        const hasBackgroundPermission = await Location.getBackgroundPermissionsAsync();
        
        if (hasBackgroundPermission.status === 'granted') {
          await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
            accuracy,
            timeInterval: updateInterval,
            distanceInterval: distanceFilter,
            foregroundService: {
              notificationTitle: 'CARO 운행 중',
              notificationBody: '운행 기록이 수집되고 있습니다.',
              notificationColor: '#3B82F6',
            },
            pausesUpdatesAutomatically: false,
            showsBackgroundLocationIndicator: true,
          });
        }
      }

      // 경과 시간 타이머 시작
      timerRef.current = setInterval(() => {
        const { status: currentStatus } = useDrivingStore.getState();
        if (currentStatus === 'driving') {
          incrementElapsedTime();
        }
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : '위치 추적 시작 실패');
      setIsTracking(false);
    }
  }, [
    isTracking,
    hasPermission,
    requestPermissions,
    accuracy,
    updateInterval,
    distanceFilter,
    enableBackground,
    updateLocation,
    incrementElapsedTime,
  ]);

  // 위치 추적 중지
  const stopTracking = useCallback(async () => {
    if (!isTracking) return;

    try {
      // Foreground 위치 추적 중지
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
      }

      // 백그라운드 위치 추적 중지
      const isTaskRunning = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
      if (isTaskRunning) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      }

      // 타이머 중지
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsTracking(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '위치 추적 중지 실패');
    }
  }, [isTracking]);

  // 운행 상태에 따라 자동으로 추적 시작/중지
  useEffect(() => {
    if (status === 'driving' && !isTracking) {
      startTracking();
    } else if (status === 'idle' && isTracking) {
      stopTracking();
    }
  }, [status, isTracking, startTracking, stopTracking]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 초기 권한 확인
  useEffect(() => {
    const checkPermissions = async () => {
      const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
      setHasPermission(foregroundStatus === 'granted');
    };
    checkPermissions();
  }, []);

  return {
    hasPermission,
    isTracking,
    currentLocation,
    error,
    requestPermissions,
    startTracking,
    stopTracking,
  };
}
