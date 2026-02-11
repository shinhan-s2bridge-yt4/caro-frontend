import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * GPS 경로 좌표 로컬 영속화 서비스
 *
 * 운행 중 GPS 좌표를 AsyncStorage에 주기적으로 flush하여
 * 앱 크래시/강제 종료 시에도 경로 데이터를 보존합니다.
 *
 * 흐름:
 *   운행 시작 → startSession()
 *   GPS 수신  → addPoint() (메모리 버퍼에 추가, 자동 flush)
 *   운행 종료 → getSessionRoute() → 서버 전송 → clearSession()
 *   앱 재시작 → getOrphanedSession() → 미전송 데이터 복구
 */

// ─── 타입 ───────────────────────────────────────────

/** 경로 좌표 (컴팩트 포맷) */
export interface RouteCoordinate {
  lat: number;
  lng: number;
  timestamp: number; // Unix timestamp (ms)
}

/** 영속화된 세션 데이터 */
interface PersistedSession {
  sessionId: string;
  startTime: number;
  points: RouteCoordinate[];
}

// ─── 상수 ───────────────────────────────────────────

const STORAGE_KEY = 'caro-route-session';
const FLUSH_THRESHOLD = 20; // 20개 쌓이면 flush

// ─── 메모리 버퍼 ────────────────────────────────────

let buffer: RouteCoordinate[] = [];
let currentSessionId: string | null = null;
let flushTimer: NodeJS.Timeout | null = null;

// ─── 세션 관리 ──────────────────────────────────────

/**
 * 새 운행 세션을 시작합니다.
 * 기존 세션이 있으면 덮어씁니다 (정상 종료 안 된 경우).
 */
export async function startSession(): Promise<string> {
  const sessionId = `route-${Date.now()}`;
  currentSessionId = sessionId;
  buffer = [];

  const session: PersistedSession = {
    sessionId,
    startTime: Date.now(),
    points: [],
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));

  // 1분마다 강제 flush (이동이 없어도 버퍼에 남은 것 저장)
  if (flushTimer) clearInterval(flushTimer);
  flushTimer = setInterval(() => {
    if (buffer.length > 0) {
      flushToStorage().catch(console.warn);
    }
  }, 60_000);

  return sessionId;
}

/**
 * GPS 좌표를 버퍼에 추가합니다.
 * 버퍼가 FLUSH_THRESHOLD에 도달하면 자동으로 AsyncStorage에 flush합니다.
 */
export function addPoint(lat: number, lng: number, timestamp: number): void {
  if (!currentSessionId) return;

  buffer.push({ lat, lng, timestamp });

  if (buffer.length >= FLUSH_THRESHOLD) {
    flushToStorage().catch(console.warn);
  }
}

/**
 * 메모리 버퍼의 좌표를 AsyncStorage에 flush합니다.
 */
async function flushToStorage(): Promise<void> {
  if (buffer.length === 0 || !currentSessionId) return;

  const pointsToFlush = [...buffer];
  buffer = [];

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const session: PersistedSession = JSON.parse(raw);
    session.points.push(...pointsToFlush);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    // flush 실패 시 버퍼에 복원 (다음 flush에서 재시도)
    buffer.unshift(...pointsToFlush);
    console.warn('[RoutePersist] flush 실패:', err);
  }
}

// ─── 세션 종료 / 데이터 조회 ────────────────────────

/**
 * 현재 세션의 전체 경로 좌표를 반환합니다.
 * 메모리 버퍼에 남아있는 좌표도 포함합니다.
 */
export async function getSessionRoute(): Promise<RouteCoordinate[]> {
  // 먼저 버퍼에 남은 것 flush
  await flushToStorage();

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const session: PersistedSession = JSON.parse(raw);
    return session.points;
  } catch {
    return [];
  }
}

/**
 * 현재 세션을 정리합니다 (서버 전송 성공 후 호출).
 */
export async function clearSession(): Promise<void> {
  currentSessionId = null;
  buffer = [];

  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }

  await AsyncStorage.removeItem(STORAGE_KEY);
}

// ─── 앱 재시작 시 복구 ──────────────────────────────

/**
 * 미전송된 고아 세션(orphaned session)이 있는지 확인합니다.
 * 앱 크래시 후 재시작 시 호출하여 데이터를 복구합니다.
 *
 * @returns 미전송 세션 데이터 (없으면 null)
 */
export async function getOrphanedSession(): Promise<{
  sessionId: string;
  startTime: number;
  points: RouteCoordinate[];
} | null> {
  // 현재 운행 중이면 고아 세션이 아님
  if (currentSessionId) return null;

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const session: PersistedSession = JSON.parse(raw);

    // 포인트가 없는 빈 세션이면 정리하고 null 반환
    if (session.points.length === 0) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * 현재 활성 세션이 있는지 확인합니다.
 */
export function hasActiveSession(): boolean {
  return currentSessionId !== null;
}
