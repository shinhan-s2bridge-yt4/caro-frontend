import { Platform, Pressable, View, Text, Modal, ActivityIndicator, ScrollView, Switch, Image } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { colors, typography } from '@/theme';
import { NavigationBar } from '@/components/common/Bar/NavigationBar';
import { ToggleButton, type ToggleOption, type ToggleValue } from '@/components/common/Button/ToggleButton';
import { MainButton } from '@/components/common/Button/MainButton';
import { Toast } from '@/components/common/Toast/Toast';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

// 네이티브 전용 - 웹에서는 import하지 않음
let Location: any = null;
if (Platform.OS !== 'web') {
  Location = require('expo-location');
}
import { useDrivingStore, formatElapsedTime, formatDistance } from '@/stores/drivingStore';
import { useDriveTracking, reverseGeocodeToAddress } from '@/hooks/useDriveTracking';
import { useBluetoothConnection, type BleDevice } from '@/hooks/useBluetoothConnection';
import { useBluetoothSettingsStore } from '@/stores/bluetoothSettingsStore';
import { useProfileStore } from '@/stores/profileStore';
import { useMyCarStore } from '@/stores/myCarStore';
import { useAuthStore } from '@/stores/authStore';
import { createDrivingRecord, getTodayDrivingRecords } from '@/services/drivingRecordService';
import type { DrivingRecord } from '@/types/drivingRecord';
import { setPrimaryCar } from '@/services/vehicleService';
import { fetchPointHistory, fetchPointEstimate, fetchPendingPoints, claimPoints, checkAttendance, fetchAttendanceStatus, type PointHistory } from '@/services/rewardService';
import { fetchDashboard } from '@/services/profileService';
import { syncWidgetData, calculateProgressRatio } from '@/hooks/useWidgetSync';
import { getSessionRoute, clearSession, getOrphanedSession } from '@/services/routePersistService';
import { formatDateOnly, formatTimeHHMM } from '@/utils/date';
import { getTabRoute } from '@/utils/navigation';

import BRightIcon from '@/assets/icons/bright.svg';
import BoxIcon from '@/assets/icons/box.svg';
import BCarIcon from '@/assets/icons/bcar.svg';
import GCarIcon from '@/assets/icons/gcar.svg';
import RightIcon from '@/assets/icons/RightIcon.svg';
import HandIcon from '@/assets/icons/hand.svg';
import PlayIcon from '@/assets/icons/play.svg';
import PauseIcon from '@/assets/icons/pause.svg';
import BCoinIcon from '@/assets/icons/bcoin.svg';
import XIcon from '@/assets/icons/x_icon.svg';
import PointIcon from '@/assets/icons/point.svg';
import InfoIcon from '@/assets/icons/info.svg';
import BCheckIcon from '@/assets/icons/bcheck.svg';
import GCheckIcon from '@/assets/icons/gcheck.svg';
import WXIcon from '@/assets/icons/w_x.svg';
import CalendarIcon from '@/assets/icons/calendar.svg';
import LogoIcon from '@/assets/icons/logo.svg';
import YCoinIcon from '@/assets/icons/ycoin.svg';
import SirenIcon from '@/assets/icons/siren.svg';
import YPointIcon from '@/assets/icons/ypoint.svg';
import RCarIcon from '@/assets/icons/rcar.svg';
import RCalIcon from '@/assets/icons/rcal.svg';
import RCouponIcon from '@/assets/icons/rcoupon.svg';
import Day1Icon from '@/assets/icons/Day1.svg';
import Day2Icon from '@/assets/icons/Day2.svg';
import Day3Icon from '@/assets/icons/Day3.svg';
import Day4Icon from '@/assets/icons/Day4.svg';
import Day5Icon from '@/assets/icons/Day5.svg';
import Day6Icon from '@/assets/icons/Day6.svg';
import Day7Icon from '@/assets/icons/Day7.svg';
import UpIcon from '@/assets/icons/UpIcon.svg';
import DownIcon from '@/assets/icons/DownIcon.svg';
import B1Icon from '@/assets/icons/b1.svg';
import B2Icon from '@/assets/icons/b2.svg';
import B3Icon from '@/assets/icons/b3.svg';
import B4Icon from '@/assets/icons/b4.svg';
import B5Icon from '@/assets/icons/b5.svg';
import B6Icon from '@/assets/icons/b6.svg';
import B7Icon from '@/assets/icons/b7.svg';
import B8Icon from '@/assets/icons/b8.svg';
import B9Icon from '@/assets/icons/b9.svg';

const DRIVE_NUMBER_ICONS = [B1Icon, B2Icon, B3Icon, B4Icon, B5Icon, B6Icon, B7Icon, B8Icon, B9Icon];

function formatDuration(startISO: string, endISO: string): string {
  const diffMs = new Date(endISO).getTime() - new Date(startISO).getTime();
  const totalSec = Math.max(0, Math.floor(diffMs / 1000));
  const hh = Math.floor(totalSec / 3600).toString().padStart(2, '0');
  const mm = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
  const ss = (totalSec % 60).toString().padStart(2, '0');
  return `${hh} : ${mm} : ${ss}`;
}

function formatPointAmount(amount: number) {
  const abs = Math.abs(amount).toLocaleString('ko-KR');
  return `${amount >= 0 ? '+ ' : '- '}${abs} P`;
}

export default function HomeScreen() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const { cars, loadMyCars } = useMyCarStore();
  
  const [topToggle, setTopToggle] = useState<ToggleValue>(0);
  const [isStopModalVisible, setIsStopModalVisible] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isErrorToastVisible, setIsErrorToastVisible] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isCarSelectModalVisible, setIsCarSelectModalVisible] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  const [isBtModalVisible, setIsBtModalVisible] = useState(false);
  const [expandedDriveIndices, setExpandedDriveIndices] = useState<Set<number>>(new Set());
  const [todayRecords, setTodayRecords] = useState<DrivingRecord[]>([]);
  const [pointHistories, setPointHistories] = useState<PointHistory[]>([]);
  const [attendanceStreak, setAttendanceStreak] = useState(0);
  const [isAttendanceChecked, setIsAttendanceChecked] = useState(false);
  const [isAttendanceModalVisible, setIsAttendanceModalVisible] = useState(false);
  const [attendancePoints, setAttendancePoints] = useState(0);
  const [attendedDays, setAttendedDays] = useState<Set<number>>(new Set());

  // 블루투스 연결 관리
  const {
    isBleAvailable,
    isBluetoothEnabled,
    isScanning,
    connectedDevice,
    nearbyDevices,
    isClassicBtAvailable: hasClassicBt,
    classicAudioDevice,
    isMonitoring,
    startScan,
    stopScan,
    setAsCarDevice,
    setClassicAsCarDevice,
    error: btError,
  } = useBluetoothConnection();

  const {
    autoStartEnabled,
    pairedDevices,
    activeDeviceId,
    setAutoStartEnabled,
    removePairedDevice,
    setActiveDevice,
  } = useBluetoothSettingsStore();

  // 차량 목록 로드
  useEffect(() => {
    if (accessToken) {
      loadMyCars(accessToken);
    }
  }, [accessToken, loadMyCars]);

  // 차량 목록 로드 후 첫 번째 차량 자동 선택
  useEffect(() => {
    if (cars.length > 0 && selectedCarId === null) {
      setSelectedCarId(cars[0].id);
    }
  }, [cars, selectedCarId]);

  // 오늘의 운행 기록 조회
  useEffect(() => {
    if (!accessToken) return;
    getTodayDrivingRecords()
      .then((res) => setTodayRecords(res.records))
      .catch((err) => console.warn('오늘의 운행 기록 조회 실패:', err));
  }, [accessToken]);

  // 앱 시작 시 미전송 경로 데이터 복구 (앱 크래시 후 재시작 대비)
  useEffect(() => {
    if (!accessToken || !selectedCarId) return;
    (async () => {
      try {
        const orphaned = await getOrphanedSession();
        if (!orphaned || orphaned.points.length === 0) return;

        console.log(`[RoutePersist] 미전송 경로 발견: ${orphaned.points.length}개 좌표, 세션 ${orphaned.sessionId}`);

        const startDate = new Date(orphaned.startTime);
        const endPoint = orphaned.points[orphaned.points.length - 1];
        const endDate = new Date(endPoint.timestamp);

        // 미전송 데이터 재전송 시도
        await createDrivingRecord({
          request: {
            memberCarId: selectedCarId,
            startDateTime: startDate.toISOString(),
            endDateTime: endDate.toISOString(),
            distanceKm: 0, // 서버에서 좌표 기반으로 재계산 필요 시 0 전송
            startLocation: '복구된 운행',
            endLocation: '복구된 운행',
            routeCoordinates: orphaned.points,
          },
          accessToken,
        });

        await clearSession();
        console.log('[RoutePersist] 미전송 경로 복구 완료');

        // 오늘의 운행 기록 새로고침
        getTodayDrivingRecords()
          .then((res) => setTodayRecords(res.records))
          .catch(() => {});
      } catch (err) {
        console.warn('[RoutePersist] 미전송 경로 복구 실패 (다음 시작 시 재시도):', err);
      }
    })();
  }, [accessToken, selectedCarId]);

  // 위젯 데이터 동기화 (앱 시작 시)
  useEffect(() => {
    if (!accessToken) return;
    (async () => {
      try {
        const [dashboardData, pendingData] = await Promise.all([
          fetchDashboard(),
          fetchPendingPoints(),
        ]);
        const distance = dashboardData.totalDistanceKm;
        const points = pendingData.totalPendingPoints;
        setPendingPoints(points);
        syncWidgetData({
          totalDistanceKm: distance,
          pendingPoints: points,
          progressRatio: calculateProgressRatio(distance),
        });
      } catch (err) {
        console.warn('위젯 데이터 동기화 실패:', err);
      }
    })();
  }, [accessToken]);

  // 포인트 이력 및 출석 현황 조회
  useEffect(() => {
    if (topToggle === 1) {
      fetchPointHistory()
        .then((data) => {
          setPointHistories(data.histories);
        })
        .catch((err) => {
          console.warn('포인트 이력 조회 실패:', err);
          setPointHistories([]);
        });

      fetchAttendanceStatus()
        .then((data) => {
          setAttendanceStreak(data.currentStreak);
          setIsAttendanceChecked(data.isAttendedToday);
          setAttendedDays(new Set(data.attendanceRecords.map((r) => r.dayOrder)));
        })
        .catch((err) => {
          console.warn('출석 현황 조회 실패:', err);
        });

      fetchPendingPoints()
        .then((data) => setPendingPoints(data.totalPendingPoints))
        .catch((err) => {
          console.warn('미수령 포인트 조회 실패:', err);
          setPendingPoints(0);
        });
    }
  }, [topToggle]);

  // BLE 디바이스 페어링 핸들러
  const handlePairDevice = (device: BleDevice) => {
    setAsCarDevice(device);
    stopScan();
  };

  // Classic BT 오디오 디바이스 페어링 핸들러
  const handlePairClassicDevice = () => {
    if (classicAudioDevice) {
      setClassicAsCarDevice(classicAudioDevice);
    }
  };

  // 운행 상태 관리
  const {
    status: drivingStatus,
    elapsedSeconds,
    totalDistanceKm,
    startTime,
    startLocationName,
    isBluetoothConnected,
    startDriving,
    stopDriving,
    reset: resetDriving,
  } = useDrivingStore();
  
  const [isSaving, setIsSaving] = useState(false);

  // GPS 추적
  const {
    hasPermission,
    isTracking,
    requestPermissions,
    error: trackingError,
  } = useDriveTracking();

  // 운행 중 실시간 위젯 동기화 (1분 간격)
  useEffect(() => {
    if (drivingStatus !== 'driving') return;
    const interval = setInterval(() => {
      syncWidgetData({
        totalDistanceKm,
        pendingPoints: 0,
        progressRatio: calculateProgressRatio(totalDistanceKm),
      });
    }, 60000);
    // 운행 시작 시 즉시 1회 동기화
    syncWidgetData({
      totalDistanceKm,
      pendingPoints: 0,
      progressRatio: calculateProgressRatio(totalDistanceKm),
    });
    return () => clearInterval(interval);
  }, [drivingStatus, totalDistanceKm]);

  // 운행 상태에 따른 텍스트
  const statusText = useMemo(() => {
    if (drivingStatus === 'driving') {
      return connectedDevice ? '블루투스 운행중' : '운행중';
    }
    if (isMonitoring && activeDeviceId) {
      return '블루투스 대기중';
    }
    return '운행 대기중';
  }, [drivingStatus, connectedDevice, isMonitoring, activeDeviceId]);

  // 운행 상태에 따른 상태 표시 색상
  const statusColor = useMemo(() => {
    if (drivingStatus === 'driving') return colors.red[40]; // 운행 중 - 빨간색
    if (isMonitoring && activeDeviceId) return colors.primary[50]; // 블루투스 대기 - 파란색
    return colors.coolNeutral[40];
  }, [drivingStatus, isMonitoring, activeDeviceId]);

  // 예상 적립 포인트 (API 기반)
  const [estimatedPoints, setEstimatedPoints] = useState(0);

  // 미수령 운행 포인트
  const [pendingPoints, setPendingPoints] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimAnimating, setIsClaimAnimating] = useState(false);

  // 포인트 받기
  const handleClaimPoints = useCallback(async () => {
    if (isClaiming || pendingPoints <= 0) return;
    setIsClaiming(true);
    setIsClaimAnimating(true);
    try {
      await claimPoints();
      // 미수령 포인트 새로고침
      const data = await fetchPendingPoints();
      setPendingPoints(data.totalPendingPoints);
      // 위젯 데이터 동기화
      fetchDashboard().then((dashboard) => {
        syncWidgetData({
          totalDistanceKm: dashboard.totalDistanceKm,
          pendingPoints: data.totalPendingPoints,
          progressRatio: calculateProgressRatio(dashboard.totalDistanceKm),
        });
      }).catch(() => {});
    } catch (err) {
      console.warn('포인트 수령 실패:', err);
    } finally {
      // gif 애니메이션을 1초간 보여준 뒤 원래 아이콘으로 복귀
      setTimeout(() => {
        setIsClaimAnimating(false);
      }, 1000);
      setIsClaiming(false);
    }
  }, [isClaiming, pendingPoints]);

  // 수동 운행 시작/중지 핸들러
  const handleDrivingToggle = async () => {
    if (drivingStatus === 'driving') {
      // 운행 중이면 종료 확인 팝업 표시 + 예상 포인트 조회
      setIsStopModalVisible(true);
      if (totalDistanceKm > 0) {
        fetchPointEstimate(Math.round(totalDistanceKm * 100) / 100)
          .then((res) => setEstimatedPoints(res.estimatedPoints))
          .catch(() => setEstimatedPoints(0));
      }
    } else {
      // GPS 권한이 없으면 요청
      if (!hasPermission) {
        const granted = await requestPermissions();
        if (!granted) return;
      }
      startDriving(); // 내부에서 경로 영속화 세션도 자동 시작됨
    }
  };

  // 운행 기록 저장 공통 함수
  const saveDrivingRecord = useCallback(async () => {
    // 주행 거리가 없으면 에러
    const { totalDistanceKm: distance, startTime: start, startLocationName: startLoc } =
      useDrivingStore.getState();

    if (distance <= 0) {
      resetDriving();
      setIsErrorToastVisible(true);
      return;
    }

    setIsSaving(true);

    try {
      const endTime = new Date();
      const startDate = start ? new Date(start) : endTime;

      // 현재 위치(도착지) 역지오코딩
      let endLocationName = '알 수 없는 위치';
      try {
        if (Location) {
          const currentPos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          endLocationName = await reverseGeocodeToAddress(
            currentPos.coords.latitude,
            currentPos.coords.longitude,
          );
        }
      } catch {
        console.warn('종료 위치 역지오코딩 실패');
      }

      // ISO 8601 datetime 변환
      const startDateTime = startDate.toISOString();
      const endDateTime = endTime.toISOString();

      // 로컬 디스크에서 영속화된 경로 좌표 읽기
      const routeCoordinates = await getSessionRoute();

      // API 호출
      if (accessToken && selectedCarId) {
        const requestBody = {
          memberCarId: selectedCarId,
          startDateTime,
          endDateTime,
          distanceKm: Math.round(distance * 100) / 100,
          startLocation: startLoc || '알 수 없는 위치',
          endLocation: endLocationName,
          ...(routeCoordinates.length > 0 && { routeCoordinates }),
        };
        console.log('운행 기록 저장 요청:', JSON.stringify({
          ...requestBody,
          routeCoordinates: `[${routeCoordinates.length}개 좌표]`,
        }, null, 2));

        await createDrivingRecord({
          request: requestBody,
          accessToken,
        });

        // 서버 전송 성공 → 로컬 세션 정리
        await clearSession();
      }
    } catch (err: any) {
      console.error('운행 기록 저장 실패:', err);
      if (err?.response) {
        console.error('서버 응답 status:', err.response.status);
        console.error('서버 응답 data:', JSON.stringify(err.response.data, null, 2));
      }
    } finally {
      resetDriving();
      setIsToastVisible(true);
      setIsSaving(false);
      // 운행 기록 저장 후 오늘의 운행 기록 새로고침
      getTodayDrivingRecords()
        .then((res) => setTodayRecords(res.records))
        .catch(() => {});
      // 운행 기록 저장 후 위젯 데이터 동기화
      Promise.all([fetchDashboard(), fetchPendingPoints()])
        .then(([dashboard, pending]) => {
          syncWidgetData({
            totalDistanceKm: dashboard.totalDistanceKm,
            pendingPoints: pending.totalPendingPoints,
            progressRatio: calculateProgressRatio(dashboard.totalDistanceKm),
          });
        })
        .catch(() => {});
    }
  }, [accessToken, selectedCarId, resetDriving]);

  // 운행 종료 확인 (수동 버튼)
  const handleConfirmStop = async () => {
    if (isSaving) return;
    setIsStopModalVisible(false);
    await saveDrivingRecord();
  };

  // 블루투스 연결 해제 시 자동 운행 기록 저장
  const prevBtConnectedRef = useRef(isBluetoothConnected);
  const prevDrivingStatusRef = useRef(drivingStatus);

  useEffect(() => {
    const wasDriving = prevDrivingStatusRef.current === 'driving';
    const wasConnected = prevBtConnectedRef.current;
    const nowDisconnected = !isBluetoothConnected;

    // BT가 연결 해제됐고 + 이전에 운행 중이었으면 → 자동 저장
    if (wasDriving && wasConnected && nowDisconnected) {
      console.log('블루투스 연결 해제 감지 → 운행 기록 자동 저장');
      saveDrivingRecord();
    }

    prevBtConnectedRef.current = isBluetoothConnected;
    prevDrivingStatusRef.current = drivingStatus;
  }, [isBluetoothConnected, drivingStatus, saveDrivingRecord]);

  // 운행 종료 취소
  const handleCancelStop = () => {
    setIsStopModalVisible(false);
  };

  const toggleOptions = useMemo((): [ToggleOption, ToggleOption] => {
    return [
      { label: '운행기록', icon: BCarIcon, activeIcon: BCarIcon },
      { label: '포인트', icon: BCoinIcon, activeIcon: YPointIcon },
    ];
  }, []);

  // 현재 선택된 차량 정보
  const selectedCar = useMemo(() => {
    if (cars.length === 0) return null;
    return cars.find((car) => car.id === selectedCarId) || cars[0];
  }, [cars, selectedCarId]);

  const { loadProfile } = useProfileStore();

  // 차량 선택 핸들러 (대표 차량 변경 API 호출)
  const handleCarSelect = async (carId: number) => {
    setSelectedCarId(carId);
    setIsCarSelectModalVisible(false);
    try {
      await setPrimaryCar(carId);
      // 대표 차량 변경 후 프로필 새로고침
      if (accessToken) {
        await loadProfile(accessToken);
      }
    } catch (err) {
      console.warn('대표 차량 변경 실패:', err);
    }
  };

  // 프로필 스토어에서 이름 가져오기
  const userName = useProfileStore((s) => s.name) || '사용자';

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.coolNeutral[10] }}>
    <View style={{ flex: 1, backgroundColor: colors.coolNeutral[10] }}>
      {/* 드롭다운 닫기 오버레이는 드롭다운과 동일한 stacking context에서 처리 */}
      <View
        style={{
          flex: 1,
          width: '100%',
        }}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 20, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 12,
            }}
          >
            <LogoIcon height={33} width={85} />
            <View>
              <ToggleButton
                options={toggleOptions}
                value={topToggle}
                onChange={(v) => setTopToggle(v)}
                height={34}
                containerStyle={topToggle === 1 ? { backgroundColor: '#FEDE51' } : undefined}
                activeTextColor={topToggle === 1 ? '#FEDE51' : undefined}
              />
              {topToggle === 0 && pendingPoints > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -3,
                    right: 5,
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: colors.red[50],
                  }}
                />
              )}
            </View>
          </View>

          {/* Content (from Greeting) */}
          <View style={{ paddingHorizontal: 20, gap: 32 }}>
            {/* Greeting */}
            <View style={{ gap: 5 }}>
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.h1Bold,
                  color: colors.coolNeutral[90],
                }}
              >
                반가워요 {userName}님
              </Text>
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body2Medium,
                  color: colors.coolNeutral[50],
                }}
              >
                오늘도 안전운전 하세요 🚗
              </Text>
            </View>

            {topToggle === 0 && (
            <View style={{ gap: 24 }}>
              {/* 블루투스 자동 운행 카드 */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="bluetooth-settings"
                onPress={() => setIsBtModalVisible(true)}
                style={{
                  backgroundColor: isMonitoring && activeDeviceId
                    ? colors.primary[10]
                    : colors.background.default,
                  borderRadius: 18,
                  borderWidth: isMonitoring && activeDeviceId ? 1 : 0,
                  borderColor: colors.primary[30],
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        backgroundColor: connectedDevice || classicAudioDevice
                          ? colors.primary[50]
                          : isMonitoring && activeDeviceId
                            ? colors.primary[30]
                            : colors.coolNeutral[30],
                      }}
                    />
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body2Bold,
                        color: connectedDevice || classicAudioDevice
                          ? colors.primary[60]
                          : colors.coolNeutral[70],
                      }}
                    >
                      {connectedDevice
                        ? `${connectedDevice.name} 연결됨`
                        : classicAudioDevice
                          ? `${classicAudioDevice.name} 연결됨`
                          : activeDeviceId && autoStartEnabled
                            ? '블루투스 자동 운행 대기 중'
                            : '블루투스 자동 운행'}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.body3Medium,
                      color: colors.coolNeutral[40],
                      marginLeft: 16,
                    }}
                  >
                    {connectedDevice || classicAudioDevice
                      ? '자동으로 운행이 시작되었어요'
                      : pairedDevices.length > 0
                        ? '차량 블루투스 연결 시 자동 운행 시작'
                        : '탭하여 차량 블루투스를 등록하세요'}
                  </Text>
                </View>
                <RightIcon width={20} height={20} />
              </Pressable>

              {/* Today Drive Card */}
              <View
                style={{
                  backgroundColor: colors.coolNeutral[10],
                  borderRadius: 20,
                  padding: 18,
                  shadowColor: 'rgb(144, 144, 144)',
                  shadowOpacity: 0.4,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: 5,
                  zIndex: 10,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1, alignItems: 'flex-start' }}>
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.h2Bold,
                        color: colors.coolNeutral[80],
                      }}
                    >
                      오늘의 운행
                    </Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: statusColor }} />
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body3Medium,
                          color: colors.coolNeutral[50],
                        }}
                      >
                        {statusText}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 차량 선택 버튼 */}
                <View style={{ marginTop: 12, position: 'relative', zIndex: isCarSelectModalVisible ? 100 : 0 }}>
                  {selectedCar ? (
                  <Pressable
                    onPress={() => setIsCarSelectModalVisible(!isCarSelectModalVisible)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.primary[10],
                      borderRadius: 12,
                      paddingVertical: 8,
                      paddingHorizontal: 20,
                      gap: 12,
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="select-car"
                  >
                    <BCarIcon width={20} height={20} />
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body3Semibold,
                        color: colors.primary[50],
                      }}
                    >
                      {selectedCar.brandName} {selectedCar.modelName} {selectedCar.variant}
                    </Text>
                    <View
                      style={{
                        width: 1.4,
                        height: 17,
                        backgroundColor: colors.primary[50],
                      }}
                    />
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body3Semibold,
                          color: colors.primary[50],
                        }}
                      >
                        {selectedCar.registrationNumber}
                      </Text>
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          setIsTooltipVisible(!isTooltipVisible);
                        }}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="car-info"
                      >
                        <InfoIcon width={16} height={16} />
                      </Pressable>
                    </View>
                  </Pressable>
                  ) : (
                    <View
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.coolNeutral[20],
                        borderRadius: 12,
                        paddingVertical: 8,
                        paddingHorizontal: 20,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body3Semibold,
                          color: colors.coolNeutral[40],
                        }}
                      >
                        등록된 차량이 없습니다
                      </Text>
                    </View>
                  )}

                  {/* 툴팁 */}
                  {isTooltipVisible && (
                    <View
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 40,
                        marginTop: 8,
                        zIndex: 100,
                        flexShrink: 0,
                        minWidth: 220,
                      }}
                    >
                      {/* 툴팁 화살표 */}
                      <View
                        style={{
                          position: 'absolute',
                          top: -6,
                          right: 10,
                          width: 0,
                          height: 0,
                          borderLeftWidth: 6,
                          borderRightWidth: 6,
                          borderBottomWidth: 6,
                          borderLeftColor: 'transparent',
                          borderRightColor: 'transparent',
                          borderBottomColor: colors.primary[80],
                          zIndex: 101,
                        }}
                      />
                      <View
                        style={{
                          backgroundColor: colors.primary[80],
                          borderRadius: 8,
                          padding: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                          flexShrink: 0,
                          justifyContent: 'center',
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body3Medium,
                            color: colors.coolNeutral[10],
                            flexShrink: 0,
                          }}
                        >
                          눌러서 보유한 차량을 변경할 수 있어요
                        </Text>
                        <Pressable
                          onPress={() => setIsTooltipVisible(false)}
                          hitSlop={4}
                          accessibilityRole="button"
                          accessibilityLabel="close-tooltip"
                        >
                          <WXIcon width={16} height={16} />
                        </Pressable>
                      </View>
                    </View>
                  )}

                  {/* 드롭다운 배경 닫기 오버레이 */}
                  {isCarSelectModalVisible && (
                    <Pressable
                      onPress={() => setIsCarSelectModalVisible(false)}
                      style={{
                        position: 'absolute',
                        top: -500,
                        left: -500,
                        width: 3000,
                        height: 3000,
                        zIndex: 99,
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="dismiss-car-dropdown"
                    />
                  )}

                  {/* 차량 선택 드롭다운 */}
                  {isCarSelectModalVisible && (
                    <View
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: 8,
                        borderWidth: 1,
                        borderColor: colors.coolNeutral[20],
                        borderRadius: 12,
                        backgroundColor: colors.coolNeutral[10],
                        overflow: 'hidden',
                        zIndex: 200,
                        shadowColor: '#000',
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 4 },
                        elevation: 5,
                      }}
                    >
                      {/* 드롭다운 헤더 */}
                      <View
                        style={{
                          paddingVertical: 14,
                          paddingHorizontal: 20,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.coolNeutral[20],
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body3Semibold,
                            color: colors.coolNeutral[40],
                          }}
                        >
                          차량 변경
                        </Text>
                      </View>

                      {/* 차량 목록 */}
                      {cars.map((car) => {
                        const isSelected = car.id === selectedCarId;
                        return (
                          <Pressable
                            key={car.id}
                            onPress={() => handleCarSelect(car.id)}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              paddingVertical: 14,
                              paddingRight: 12,
                              paddingLeft: 25,
                              backgroundColor: isSelected ? colors.primary[10] : 'transparent',
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={`select-car-${car.id}`}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              {isSelected ? (
                                <BCarIcon width={20} height={20} />
                              ) : (
                                <GCarIcon width={20} height={20} />
                              )}
                              <Text
                                style={{
                                  fontFamily: typography.fontFamily.pretendard,
                                  ...typography.styles.body3Semibold,
                                  color: isSelected ? colors.primary[50] : colors.coolNeutral[40],
                                  width: 100,
                                  marginLeft: 8,
                                }}
                              >
                                {car.brandName} {car.modelName} {car.variant}
                              </Text>
                              <View
                                style={{
                                  width: 1,
                                  height: 17,
                                  backgroundColor: isSelected ? colors.primary[40] : colors.coolNeutral[30],
                                  marginHorizontal: 12,
                                }}
                              />
                              <Text
                                style={{
                                  fontFamily: typography.fontFamily.pretendard,
                                  ...typography.styles.body3Semibold,
                                  color: isSelected ? colors.primary[50] : colors.coolNeutral[40],
                                }}
                              >
                                {car.registrationNumber}
                              </Text>
                            </View>
                            <View
                              style={{ }}
                            >
                              {isSelected ? (
                                <BCheckIcon width={16} height={16} />
                              ) : (
                                <GCheckIcon width={16} height={16} />
                              )}
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </View>

                <View style={{ marginTop: 16, flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1, gap: 8 }}>
                    <View style={{ gap: 6 }}>
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body2Medium,
                          color: colors.coolNeutral[50],
                        }}
                      >
                        주행거리
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.T1Bold,
                            color: colors.primary[70],
                          }}
                        >
                          {formatDistance(totalDistanceKm)}
                        </Text>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.h3Bold,
                            color: colors.primary[70],
                            paddingBottom: 6,
                          }}
                        >
                          {totalDistanceKm < 0.1 ? 'm' : 'km'}
                        </Text>
                      </View>
                    </View>

                    <View style={{ gap: 6 }}>
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body2Medium,
                          color: colors.coolNeutral[50],
                        }}
                      >
                        운행시간
                      </Text>
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.T1Bold,
                          color: colors.primary[70],
                        }}
                      >
                        {formatElapsedTime(elapsedSeconds)}
                      </Text>
                    </View>
                  </View>

                  <View style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                    <ExpoImage
                      source={require('@/assets/icons/homecar.gif')}
                      style={{ width: 150, height: 110 }}
                      cachePolicy="memory-disk"
                      priority="high"
                      autoplay={true}
                    />
                  </View>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={drivingStatus === 'driving' ? 'stop-driving' : 'start-driving'}
                  onPress={handleDrivingToggle}
                  style={{
                    marginTop: 18,
                    height: 54,
                    borderRadius: 16,
                    backgroundColor: drivingStatus === 'driving' ? colors.red[40] : colors.primary[50],
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: 12,
                    paddingHorizontal: 28,
                    paddingVertical: 12,
                  }}
                >
                  {/* Play/Pause icon */}
                  {drivingStatus === 'driving' ? (
                    <PauseIcon width={24} height={24} />
                  ) : (
                    <PlayIcon width={24} height={24} />
                  )}
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.h3Bold,
                      color: colors.coolNeutral[10],
                    }}
                  >
                    {drivingStatus === 'driving' ? '운행 중지하기' : '운행 시작하기'}
                  </Text>
                </Pressable>
              </View>

              {/* 운행 기록 카드 목록 */}
              {todayRecords.length > 0 && (
              <View style={{ gap: 20 }}>
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body3Medium,
                  color: colors.coolNeutral[40],
                  textAlign: 'center',
                }}
              >
                가장 최근 운행 두 건만 보여요!
              </Text>
              {todayRecords.slice(0, 2).map((record, index) => {
                const isExpanded = expandedDriveIndices.has(index);
                const NumberIcon = DRIVE_NUMBER_ICONS[index] || DRIVE_NUMBER_ICONS[0];
                const carName = `${record.vehicleBrandName} ${record.vehicleModelName}`;
                return (
                  <View
                    key={record.id}
                    style={{
                      backgroundColor: colors.background.default,
                      borderRadius: 20,
                      padding: 20,
                    }}
                  >
                    {/* 헤더: 번호 + 운행 + 토글 */}
                    <Pressable
                      onPress={() => setExpandedDriveIndices((prev) => {
                        const next = new Set(prev);
                        if (next.has(index)) next.delete(index);
                        else next.add(index);
                        return next;
                      })}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`toggle-drive-${index}`}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <NumberIcon width={16} height={16} />
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body1Semibold,
                            color: colors.coolNeutral[80],
                          }}
                        >
                          운행
                        </Text>
                      </View>
                      {isExpanded ? (
                        <UpIcon width={22} height={22} />
                      ) : (
                        <DownIcon width={22} height={22} />
                      )}
                    </Pressable>

                    {/* 요약 정보: 주행거리, 운행시간, 적립 포인트 */}
                    <View style={{ marginTop: 16, gap: 4 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body3Medium,
                            color: colors.coolNeutral[50],
                          }}
                        >
                          주행거리
                        </Text>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body2Semibold,
                            color: colors.primary[60],
                          }}
                        >
                          {record.distanceKm} km
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body3Medium,
                            color: colors.coolNeutral[50],
                          }}
                        >
                          운행시간
                        </Text>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body2Semibold,
                            color: colors.primary[60],
                          }}
                        >
                          {formatDuration(record.startDateTime, record.endDateTime)}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body3Medium,
                            color: colors.coolNeutral[50],
                          }}
                        >
                          적립 포인트
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <PointIcon width={18} height={18} />
                          <Text
                            style={{
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.body2Semibold,
                              color: colors.primary[60],
                            }}
                          >
                            {record.earnedPoints} P
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* 확장: 차량 정보 + 출발/도착 */}
                    {isExpanded && (
                      <View style={{ marginTop: 16, gap: 12 }}>
                        {/* 구분선 */}
                        <View style={{ height: 1, backgroundColor: colors.coolNeutral[30] }} />
                        {/* 차량 정보 바 */}
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: colors.coolNeutral[10],
                            borderRadius: 12,
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                            gap: 10,
                          }}
                        >
                          <BCarIcon width={20} height={20} />
                          <Text
                            style={{
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.body3Semibold,
                              color: colors.primary[50],
                            }}
                          >
                            {carName}
                          </Text>
                          <View style={{ width: 1.4, height: 17, backgroundColor: colors.primary[50] }} />
                          <Text
                            style={{
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.body3Semibold,
                              color: colors.primary[50],
                            }}
                          >
                            {record.vehicleVariantName}
                          </Text>
                        </View>

                        {/* 출발/도착 */}
                        <View style={{ gap: 8, paddingHorizontal: 4 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View
                              style={{
                                backgroundColor: colors.primary[50],
                                borderRadius: 6,
                                paddingHorizontal: 8,
                              }}
                            >
                              <Text
                                style={{
                                  fontFamily: typography.fontFamily.pretendard,
                                  ...typography.styles.captionSemibold,
                                  color: colors.coolNeutral[10],
                                }}
                              >
                                출발
                              </Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                              <Text
                                style={{
                                  fontFamily: typography.fontFamily.pretendard,
                                  ...typography.styles.body3Semibold,
                                  color: colors.coolNeutral[70],
                                }}
                              >
                                {formatTimeHHMM(record.startDateTime)}
                              </Text>
                              <Text
                                style={{
                                  fontFamily: typography.fontFamily.pretendard,
                                  ...typography.styles.body3Medium,
                                  color: colors.coolNeutral[40],
                                  flexShrink: 1,
                                }}
                                numberOfLines={1}
                              >
                                {record.startLocation}
                              </Text>
                            </View>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View
                              style={{
                                backgroundColor: colors.coolNeutral[50],
                                borderRadius: 6,
                                paddingHorizontal: 8,
                              }}
                            >
                              <Text
                                style={{
                                  fontFamily: typography.fontFamily.pretendard,
                                  ...typography.styles.captionSemibold,
                                  color: colors.coolNeutral[10],
                                }}
                              >
                                도착
                              </Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                              <Text
                                style={{
                                  fontFamily: typography.fontFamily.pretendard,
                                  ...typography.styles.body3Semibold,
                                  color: colors.coolNeutral[70],
                                }}
                              >
                                {formatTimeHHMM(record.endDateTime)}
                              </Text>
                              <Text
                                style={{
                                  fontFamily: typography.fontFamily.pretendard,
                                  ...typography.styles.body3Medium,
                                  color: colors.coolNeutral[40],
                                  flexShrink: 1,
                                }}
                                numberOfLines={1}
                              >
                                {record.endLocation}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
              </View>
              )}

              {/* Invite Banner */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="invite-friends"
                onPress={() => {
                  // TODO: 초대 기능 연결 시 교체
                }}
                style={{
                  backgroundColor: colors.primary[20],
                  borderRadius: 18,
                  height: 81,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <BoxIcon width={59} height={59} />
                <View style={{ flex: 1, gap: 4, marginLeft: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body1Bold,
                        color: colors.primary[50],
                      }}
                    >
                      출석체크 & 리워드
                    </Text>
                    <BRightIcon width={24} height={24} />
                  </View>
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.body2Medium,
                      color: colors.coolNeutral[10],
                    }}
                  >
                    매일 출석하고 포인트 받기
                  </Text>
                </View>
              </Pressable>
            </View>
            )}

            {/* GIF 프리로드 (포인트 탭 진입 시) */}
            {topToggle === 1 && (
              <>
                <Image
                  source={require('@/assets/icons/point.gif')}
                  style={{ width: 0, height: 0, position: 'absolute' }}
                />
                <Image
                  source={require('@/assets/icons/coin.gif')}
                  style={{ width: 0, height: 0, position: 'absolute' }}
                />
              </>
            )}

            {/* 포인트 콘텐츠 */}
            {topToggle === 1 && (
            <View style={{ gap: 24 }}>
              {/* 포인트 잔액 */}
              <View style={{ alignItems: 'center', gap: 20, paddingVertical: 8 }}>
                <View
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: 100,
                    borderWidth: 8,
                    borderColor: '#FEDE51',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isClaimAnimating ? (
                    <Image
                      source={require('@/assets/icons/point.gif')}
                      style={{ width: 169, height: 169, marginTop: -18 }}
                    />
                  ) : (
                    <YCoinIcon height={169} style={{ marginTop: -18 }} />
                  )}
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.h1Bold,
                      color: colors.coolNeutral[90],
                      marginTop: -36,
                    }}
                  >
                    {pendingPoints.toLocaleString('ko-KR')}
                  </Text>
                </View>
                <MainButton
                  label="포인트 받기"
                  alwaysPrimary
                  disabled={pendingPoints <= 0 || isClaiming}
                  onPress={handleClaimPoints}
                  containerStyle={{
                    width: 130,
                    backgroundColor: isClaiming ? '#CD8402' : pendingPoints > 0 ? '#FEB802' : colors.coolNeutral[30],
                  }}
                  labelStyle={isClaiming ? { color: '#FEDE51' } : undefined}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <SirenIcon width={24} height={24} />
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.captionMedium,
                      color: colors.coolNeutral[40],
                    }}
                  >
                    오늘 자정이 지나면 사라져요
                  </Text>
                </View>
              </View>

              {/* 구분선 */}
              <View style={{ height: 28, backgroundColor: colors.coolNeutral[20], marginHorizontal: -20 }} />

              {/* 출석체크 */}
              <View style={{ gap: 20, marginBottom: 8 }}>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.h3Bold,
                    color: colors.coolNeutral[80],
                  }}
                >
                  출석체크
                </Text>
                <View
                  style={{
                    backgroundColor: colors.background.default,
                    borderRadius: 16,
                    padding: 20,
                    gap: 16,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body2Semibold,
                        color: colors.coolNeutral[40],
                      }}
                    >
                      연속 {attendanceStreak > 0 ? attendanceStreak : 0}일째 출석중 !
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="attendance-check"
                      disabled={isAttendanceChecked}
                      onPress={async () => {
                        try {
                          const result = await checkAttendance();
                          setAttendanceStreak(result.streak);
                          setAttendancePoints(result.points);
                          setIsAttendanceChecked(true);
                          setIsAttendanceModalVisible(true);
                          // 출석 현황 새로고침
                          fetchAttendanceStatus()
                            .then((data) => {
                              setAttendedDays(new Set(data.attendanceRecords.map((r) => r.dayOrder)));
                            })
                            .catch(() => {});
                          // 포인트 이력 새로고침
                          fetchPointHistory()
                            .then((data) => setPointHistories(data.histories))
                            .catch(() => {});
                        } catch (err) {
                          console.warn('출석체크 실패:', err);
                        }
                      }}
                      style={{
                        backgroundColor: isAttendanceChecked ? colors.coolNeutral[30] : colors.primary[50],
                        borderRadius: 7,
                        paddingHorizontal: 10.6,
                        paddingVertical: 3.52,
                        width: 88,
                        height: 32,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body3Semibold,
                          color: colors.coolNeutral[10],
                        }}
                      >
                        {isAttendanceChecked ? '완료' : '출석체크'}
                      </Text>
                    </Pressable>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {([
                      { day: 1, Icon: Day1Icon },
                      { day: 2, Icon: Day2Icon },
                      { day: 3, Icon: Day3Icon },
                      { day: 4, Icon: Day4Icon },
                      { day: 5, Icon: Day5Icon },
                      { day: 6, Icon: Day6Icon },
                      { day: 7, Icon: Day7Icon },
                    ]).map(({ day, Icon }) => {
                      const isChecked = attendedDays.has(day);
                      return (
                      <View key={day} style={{ alignItems: 'center', gap: 4 }}>
                        {isChecked ? <BCheckIcon width={36} height={36} /> : <Icon width={36} height={36} />}
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.captionMedium,
                            color: isChecked ? colors.coolNeutral[30] : colors.coolNeutral[50],
                          }}
                        >
                          Day {day}
                        </Text>
                      </View>
                      );
                    })}
                  </View>
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.captionMedium,
                      color: colors.primary[50],
                      textAlign: 'center',
                    }}
                  >
                    오늘 출석하고 랜덤포인트 받아가세요!
                  </Text>
                </View>
              </View>

              {/* 구분선 */}
              <View style={{ height: 28, backgroundColor: colors.coolNeutral[20], marginHorizontal: -20 }} />

              {/* 최근 포인트 */}
              <View style={{ gap: 16, paddingVertical: 24, paddingHorizontal: 20, marginHorizontal: -20, marginTop: -24 }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="recent-points"
                  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                  onPress={() => router.push({ pathname: '/store', params: { tab: 'point' } })}
                >
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.h3Bold,
                      color: colors.coolNeutral[90],
                    }}
                  >
                    최근 포인트
                  </Text>
                  <RightIcon width={20} height={20} />
                </Pressable>
                <View style={{ gap: 20 }}>
                  {pointHistories.slice(0, 5).map((item, index) => {
                    const isEarn = item.pointChange >= 0;
                    const amountColor = isEarn ? colors.primary[50] : colors.red[50];
                    const displayDate = item.type === 'DRIVING' && item.drivingDetail
                      ? formatDateOnly(item.drivingDetail.startDateTime)
                      : formatDateOnly(item.date);
                    const distanceKm = item.type === 'DRIVING' && item.drivingDetail
                      ? item.drivingDetail.distanceKm
                      : null;
                    const TypeIcon = item.type === 'DRIVING'
                      ? RCarIcon
                      : item.type === 'ATTENDANCE'
                        ? RCalIcon
                        : RCouponIcon;

                    const isDriving = item.type === 'DRIVING' && item.drivingDetail?.drivingRecordId;

                    return (
                      <Pressable
                        key={`${item.date}-${index}`}
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                        disabled={!isDriving}
                        onPress={() => {
                          if (isDriving) {
                            router.push({
                              pathname: '/car-detail',
                              params: { drivingRecordId: String(item.drivingDetail!.drivingRecordId) },
                            });
                          }
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                          <View
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 12,
                              backgroundColor: colors.coolNeutral[20],
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <TypeIcon width={24} height={24} />
                          </View>
                          <View style={{ gap: 2, flex: 1 }}>
                            <Text
                              style={{
                                fontFamily: typography.fontFamily.pretendard,
                                ...typography.styles.body2Bold,
                                color: colors.coolNeutral[80],
                              }}
                              numberOfLines={1}
                            >
                              {item.description}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <CalendarIcon width={14} height={14} />
                                <Text
                                  style={{
                                    fontFamily: typography.fontFamily.pretendard,
                                    ...typography.styles.captionMedium,
                                    color: colors.coolNeutral[40],
                                  }}
                                >
                                  {displayDate}
                                </Text>
                              </View>
                              {distanceKm != null && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                  <GCarIcon width={14} height={14} />
                                  <Text
                                    style={{
                                      fontFamily: typography.fontFamily.pretendard,
                                      ...typography.styles.captionMedium,
                                      color: colors.coolNeutral[40],
                                    }}
                                  >
                                    {distanceKm} km
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body1Bold,
                            color: amountColor,
                          }}
                        >
                          {formatPointAmount(item.pointChange)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
            )}
          </View>
        </ScrollView>
      </View>

      <View style={{ width: '100%', backgroundColor: colors.coolNeutral[10] }}>
        <NavigationBar
          active="home"
          showBorder
          onPress={(tab) => router.push(getTabRoute(tab))}
        />
      </View>

      {/* 출석체크 보상 모달 */}
      <Modal
        visible={isAttendanceModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAttendanceModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 32,
          }}
        >
          <View
            style={{
              width: '100%',
              backgroundColor: colors.coolNeutral[10],
              borderRadius: 20,
              paddingHorizontal: 24,
              paddingTop: 20,
              paddingBottom: 24,
              alignItems: 'center',
            }}
          >
            {/* 닫기 버튼 */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="close-attendance-modal"
              onPress={() => setIsAttendanceModalVisible(false)}
              style={{ alignSelf: 'flex-end' }}
            >
              <XIcon width={24} height={24} />
            </Pressable>

            {/* 코인 이미지 */}
            <Image
              source={require('@/assets/icons/coin.gif')}
              style={{ width: 146, height: 146 }}
            />

            {/* 보상 텍스트 */}
            <View style={{ alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.h2Bold,
                  color: colors.coolNeutral[80],
                  textAlign: 'center',
                }}
              >
                출석체크 보상{'\n'}{attendancePoints}P 당첨!
              </Text>
            </View>

            {/* 연속 출석 정보 */}
            <View
              style={{
                width: '100%',
                backgroundColor: colors.background.default,
                borderRadius: 12,
                paddingVertical: 16,
                paddingHorizontal: 20,
                alignItems: 'center',
                gap: 4,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body3Semibold,
                  color: colors.primary[50],
                }}
              >
                {attendanceStreak}일 연속 출석중!
              </Text>
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body3Regular,
                  color: colors.coolNeutral[40],
                }}
              >
                너무 잘하고 있어요. 내일 또 만나요
              </Text>
            </View>

            {/* 출석 완료 버튼 */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="attendance-complete"
              onPress={() => setIsAttendanceModalVisible(false)}
              style={{
                width: '100%',
                backgroundColor: colors.primary[50],
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body1Bold,
                  color: colors.coolNeutral[10],
                }}
              >
                확인
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* 운행 종료 확인 모달 */}
      <Modal
        visible={isStopModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelStop}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.32)', justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              width: 296,
              backgroundColor: colors.coolNeutral[10],
              borderRadius: 20,
              padding: 20,
              gap: 28,
            }}
          >
            {/* 닫기 버튼 + 타이틀 + 설명 */}
            <View>
              {/* 닫기 버튼 */}
              <View style={{ alignItems: 'flex-end' }}>
                <Pressable
                  onPress={handleCancelStop}
                  style={{ padding: 4 }}
                  accessibilityRole="button"
                  accessibilityLabel="close-modal"
                >
                  <XIcon width={24} height={24} />
                </Pressable>
              </View>

              {/* 타이틀 + 설명 */}
              <View style={{ gap: 8 }}>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.h3Bold,
                    color: colors.coolNeutral[80],
                    textAlign: 'center',
                  }}
                >
                  운행을 종료하시겠어요?
                </Text>

                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.body2Medium,
                    color: colors.coolNeutral[40],
                    textAlign: 'center',
                  }}
                >
                  지금까지의 운행기록이 저장됩니다.
                </Text>
              </View>
            </View>

            {/* 운행 정보 카드 + 버튼 */}
            <View style={{ gap: 20 }}>
              {/* 운행 정보 카드 */}
              <View
                style={{
                  backgroundColor: colors.background.default,
                  borderRadius: 12,
                  padding: 12,
                  gap: 12,
                }}
              >
                {/* 주행 거리 */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.body2Medium,
                      color: colors.coolNeutral[60],
                    }}
                  >
                    주행 거리
                  </Text>
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.body2Bold,
                      color: colors.coolNeutral[90],
                    }}
                  >
                    {totalDistanceKm.toFixed(1)} km
                  </Text>
                </View>

                {/* 운행 시간 */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.body2Medium,
                      color: colors.coolNeutral[60],
                    }}
                  >
                    운행 시간
                  </Text>
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.body2Bold,
                      color: colors.coolNeutral[80],
                    }}
                  >
                    {formatElapsedTime(elapsedSeconds)}
                  </Text>
                </View>

                {/* 예상 적립 포인트 */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.body2Medium,
                      color: colors.coolNeutral[60],
                    }}
                  >
                    예상 적립 포인트
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <PointIcon width={16} height={16} />
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body2Bold,
                        color: colors.coolNeutral[80],
                      }}
                    >
                      {estimatedPoints} P
                    </Text>
                  </View>
                </View>
              </View>

              {/* 버튼 영역 */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
              {/* 취소 버튼 */}
              <Pressable
                onPress={handleCancelStop}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: colors.coolNeutral[20],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                accessibilityRole="button"
                accessibilityLabel="cancel-stop"
              >
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.body1Bold,
                    color: colors.coolNeutral[30],
                  }}
                >
                  취소
                </Text>
              </Pressable>

              {/* 종료하기 버튼 */}
              <Pressable
                onPress={handleConfirmStop}
                disabled={isSaving}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: isSaving ? colors.coolNeutral[30] : colors.red[40],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                accessibilityRole="button"
                accessibilityLabel="confirm-stop"
              >
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.body1Bold,
                    color: colors.coolNeutral[10],
                  }}
                >
                  {isSaving ? '저장 중...' : '종료하기'}
                </Text>
              </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* 블루투스 설정 모달 */}
      <Modal
        visible={isBtModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsBtModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.32)', justifyContent: 'flex-end' }}>
          <Pressable
            onPress={() => {
              stopScan();
              setIsBtModalVisible(false);
            }}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
            accessibilityRole="button"
            accessibilityLabel="dismiss-bt-modal"
          />
          <View
            style={{
              backgroundColor: colors.coolNeutral[10],
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: '80%',
              paddingBottom: 40,
            }}
          >
            {/* 모달 헤더 */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.coolNeutral[20],
              }}
            >
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.h3Bold,
                  color: colors.coolNeutral[80],
                }}
              >
                블루투스 자동 운행
              </Text>
              <Pressable
                onPress={() => {
                  stopScan();
                  setIsBtModalVisible(false);
                }}
                style={{ padding: 4 }}
                accessibilityRole="button"
                accessibilityLabel="close-bt-modal"
              >
                <XIcon width={24} height={24} />
              </Pressable>
            </View>

            <ScrollView style={{ paddingHorizontal: 20 }}>
              {/* 자동 시작 토글 */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.coolNeutral[20],
                }}
              >
                <View style={{ flex: 1, gap: 4 }}>
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.body1Bold,
                      color: colors.coolNeutral[80],
                    }}
                  >
                    자동 운행 시작
                  </Text>
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.body3Medium,
                      color: colors.coolNeutral[40],
                    }}
                  >
                    등록된 차량 블루투스 연결 시 자동으로 운행을 시작합니다
                  </Text>
                </View>
                <Switch
                  value={autoStartEnabled}
                  onValueChange={setAutoStartEnabled}
                  trackColor={{ false: colors.coolNeutral[20], true: colors.primary[40] }}
                  thumbColor={autoStartEnabled ? colors.primary[50] : colors.coolNeutral[30]}
                />
              </View>

              {/* 차량 블루투스 */}
              {pairedDevices.length > 0 && (
                <View style={{ paddingVertical: 16, gap: 8 }}>
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.body2Bold,
                      color: colors.coolNeutral[60],
                    }}
                  >
                    차량 블루투스
                  </Text>

                  {/* 등록된 디바이스 목록 */}
                  {pairedDevices.map((device) => {
                    const isClassicConnected = classicAudioDevice?.name === device.name;
                    const isBleConnected = connectedDevice?.id === device.id;
                    const isConnected = isClassicConnected || isBleConnected;
                    const isActive = device.id === activeDeviceId;

                    return (
                      <View
                        key={device.id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: isConnected || isActive
                            ? colors.primary[10]
                            : colors.background.default,
                          borderRadius: 12,
                          padding: 14,
                          borderWidth: isConnected || isActive ? 1 : 0,
                          borderColor: colors.primary[30],
                        }}
                      >
                        <Pressable
                          style={{ flex: 1, gap: 2 }}
                          onPress={() => setActiveDevice(device.id)}
                          accessibilityRole="button"
                          accessibilityLabel={`select-bt-${device.id}`}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 999,
                                backgroundColor: isConnected
                                  ? colors.primary[50]
                                  : colors.coolNeutral[30],
                              }}
                            />
                            <Text
                              style={{
                                fontFamily: typography.fontFamily.pretendard,
                                ...typography.styles.body2Bold,
                                color: isConnected || isActive
                                  ? colors.primary[60]
                                  : colors.coolNeutral[70],
                              }}
                            >
                              {device.name}
                            </Text>
                          </View>
                          <Text
                            style={{
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.body3Medium,
                              color: isConnected ? colors.primary[40] : colors.coolNeutral[40],
                              marginLeft: 16,
                            }}
                          >
                            {isConnected
                              ? '연결됨'
                              : isActive
                                ? '자동 연결 활성'
                                : '탭하여 활성화'}
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => removePairedDevice(device.id)}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 8,
                            backgroundColor: colors.coolNeutral[20],
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`remove-bt-${device.id}`}
                        >
                          <Text
                            style={{
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.body3Medium,
                              color: colors.coolNeutral[50],
                            }}
                          >
                            삭제
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* 새 디바이스 스캔 */}
              <View style={{ paddingVertical: 16, gap: 12 }}>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.body2Bold,
                    color: colors.coolNeutral[60],
                  }}
                >
                  새 디바이스 등록
                </Text>

                {!isBleAvailable ? (
                  <View
                    style={{
                      backgroundColor: colors.background.default,
                      borderRadius: 12,
                      padding: 16,
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body2Medium,
                        color: colors.coolNeutral[50],
                        textAlign: 'center',
                      }}
                    >
                      BLE를 사용할 수 없습니다.{'\n'}Development Build에서 실행해주세요.
                    </Text>
                  </View>
                ) : !isBluetoothEnabled ? (
                  <View
                    style={{
                      backgroundColor: colors.background.default,
                      borderRadius: 12,
                      padding: 16,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body2Medium,
                        color: colors.coolNeutral[50],
                        textAlign: 'center',
                      }}
                    >
                      블루투스를 켜주세요
                    </Text>
                  </View>
                ) : (
                  <>
                    <Pressable
                      onPress={isScanning ? stopScan : startScan}
                      style={{
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: isScanning
                          ? colors.coolNeutral[20]
                          : colors.primary[50],
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 8,
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="scan-bluetooth"
                    >
                      {isScanning && (
                        <ActivityIndicator size="small" color={colors.coolNeutral[50]} />
                      )}
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body2Bold,
                          color: isScanning
                            ? colors.coolNeutral[50]
                            : colors.coolNeutral[10],
                        }}
                      >
                        {isScanning ? '스캔 중지' : '주변 디바이스 검색'}
                      </Text>
                    </Pressable>

                    {/* 발견된 디바이스 목록 */}
                    {nearbyDevices.length > 0 && (
                      <View style={{ gap: 6 }}>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body3Medium,
                            color: colors.coolNeutral[40],
                          }}
                        >
                          발견된 디바이스 ({nearbyDevices.length})
                        </Text>
                        {nearbyDevices.map((device) => {
                          const alreadyPaired = pairedDevices.some(
                            (pd) => pd.id === device.id,
                          );
                          return (
                            <Pressable
                              key={device.id}
                              onPress={() => !alreadyPaired && handlePairDevice(device)}
                              disabled={alreadyPaired}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: colors.background.default,
                                borderRadius: 10,
                                padding: 12,
                              }}
                              accessibilityRole="button"
                              accessibilityLabel={`pair-${device.id}`}
                            >
                              <View style={{ flex: 1, gap: 2 }}>
                                <Text
                                  style={{
                                    fontFamily: typography.fontFamily.pretendard,
                                    ...typography.styles.body2Medium,
                                    color: colors.coolNeutral[70],
                                  }}
                                >
                                  {device.name || '알 수 없는 디바이스'}
                                </Text>
                                <Text
                                  style={{
                                    fontFamily: typography.fontFamily.pretendard,
                                    ...typography.styles.body3Medium,
                                    color: colors.coolNeutral[40],
                                  }}
                                >
                                  {device.rssi ? `신호 강도: ${device.rssi}dBm` : ''}
                                </Text>
                              </View>
                              <View
                                style={{
                                  paddingHorizontal: 12,
                                  paddingVertical: 6,
                                  borderRadius: 8,
                                  backgroundColor: alreadyPaired
                                    ? colors.coolNeutral[20]
                                    : colors.primary[10],
                                }}
                              >
                                <Text
                                  style={{
                                    fontFamily: typography.fontFamily.pretendard,
                                    ...typography.styles.body3Semibold,
                                    color: alreadyPaired
                                      ? colors.coolNeutral[40]
                                      : colors.primary[50],
                                  }}
                                >
                                  {alreadyPaired ? '등록됨' : '등록'}
                                </Text>
                              </View>
                            </Pressable>
                          );
                        })}
                      </View>
                    )}

                    {isScanning && nearbyDevices.length === 0 && (
                      <View style={{ alignItems: 'center', paddingVertical: 20, gap: 8 }}>
                        <ActivityIndicator size="large" color={colors.primary[40]} />
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body3Medium,
                            color: colors.coolNeutral[40],
                          }}
                        >
                          주변 블루투스 디바이스를 검색하고 있어요...
                        </Text>
                      </View>
                    )}
                  </>
                )}

                {btError && (
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.body3Medium,
                      color: colors.red[40],
                      textAlign: 'center',
                    }}
                  >
                    {btError}
                  </Text>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 운행 종료 토스트 */}
      <Toast
        visible={isToastVisible}
        message="운행기록이 저장 되었어요 !"
        actionLabel="보러가기"
        onAction={() => {
          router.push('/car');
        }}
        onDismiss={() => setIsToastVisible(false)}
        duration={5000}
      />

      {/* 주행 거리 없음 에러 토스트 */}
      <Toast
        visible={isErrorToastVisible}
        message="주행 거리가 없어 일지 작성이 안돼요!"
        onDismiss={() => setIsErrorToastVisible(false)}
        duration={5000}
        containerStyle={{ backgroundColor: colors.red[40] }}
      />
    </View>
    </SafeAreaView>
  );
}
