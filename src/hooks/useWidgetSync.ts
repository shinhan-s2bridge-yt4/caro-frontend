import { Platform } from 'react-native';
import { useCallback } from 'react';

// App Group identifier - must match the value in app.json and expo-target.config.js
const APP_GROUP_ID = 'group.com.caro.app.yhjyhw';

// Lazy-load ExtensionStorage only on iOS
let storage: any = null;
let ExtensionStorageClass: any = null;

function getStorage() {
  if (Platform.OS !== 'ios') return null;
  if (storage) return storage;
  try {
    const module = require('@bacons/apple-targets');
    ExtensionStorageClass = module.ExtensionStorage;
    storage = new ExtensionStorageClass(APP_GROUP_ID);
    return storage;
  } catch (e) {
    console.warn('[WidgetSync] ExtensionStorage not available:', e);
    return null;
  }
}

export type WidgetData = {
  totalDistanceKm: number;
  pendingPoints: number;
  progressRatio: number;
};

/**
 * 위젯 데이터를 iOS App Group 공유 저장소에 동기화합니다.
 * Android에서는 아무 동작도 하지 않습니다.
 */
export function syncWidgetData(data: WidgetData) {
  if (Platform.OS !== 'ios') return;
  const s = getStorage();
  if (!s) return;

  try {
    s.set('totalDistanceKm', data.totalDistanceKm);
    s.set('pendingPoints', data.pendingPoints);
    s.set('progressRatio', data.progressRatio);

    // 위젯 타임라인 새로고침
    ExtensionStorageClass?.reloadWidget?.('CaroWidget');
  } catch (e) {
    console.warn('[WidgetSync] Failed to sync widget data:', e);
  }
}

/**
 * 진행률 계산: 월간 목표 거리(기본 500km) 대비 달성률
 */
export function calculateProgressRatio(
  totalDistanceKm: number,
  goalKm: number = 500,
): number {
  if (goalKm <= 0) return 0;
  return Math.min(totalDistanceKm / goalKm, 1.0);
}

/**
 * 위젯 동기화를 쉽게 호출하기 위한 커스텀 훅
 */
export function useWidgetSync() {
  const sync = useCallback((data: WidgetData) => {
    syncWidgetData(data);
  }, []);

  return { syncWidgetData: sync };
}
