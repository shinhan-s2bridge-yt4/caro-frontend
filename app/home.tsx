import { Platform, Pressable, View, Text, ScrollView, Image } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { colors, typography } from '@/theme';
import { NavigationBar } from '@/components/common/Bar/NavigationBar';
import { ToggleButton, type ToggleOption, type ToggleValue } from '@/components/common/Button/ToggleButton';
import { MainButton } from '@/components/common/Button/MainButton';
import { HomeAttendanceRewardModal } from '@/components/home/modals/HomeAttendanceRewardModal';
import { HomeBluetoothSettingsModal } from '@/components/home/modals/HomeBluetoothSettingsModal';
import { HomeStopDrivingModal } from '@/components/home/modals/HomeStopDrivingModal';
import { HomeAttendanceSection } from '@/components/home/sections/HomeAttendanceSection';
import { HomeRecentPointsSection } from '@/components/home/sections/HomeRecentPointsSection';
import { HomeTodayDriveSection } from '@/components/home/sections/HomeTodayDriveSection';
import { Toast } from '@/components/common/Toast/Toast';
import { useHomePointsData } from '@/hooks/home/useHomePointsData';
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
import { fetchPointEstimate, fetchPendingPoints } from '@/services/rewardService';
import { fetchDashboard } from '@/services/profileService';
import { syncWidgetData, calculateProgressRatio } from '@/hooks/useWidgetSync';
import { getSessionRoute, clearSession, getOrphanedSession } from '@/services/routePersistService';
import { formatDateOnly } from '@/utils/date';
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
import PointIcon from '@/assets/icons/point.svg';
import InfoIcon from '@/assets/icons/info.svg';
import BCheckIcon from '@/assets/icons/bcheck.svg';
import GCheckIcon from '@/assets/icons/gcheck.svg';
import WXIcon from '@/assets/icons/w_x.svg';
import LogoIcon from '@/assets/icons/logo.svg';
import YCoinIcon from '@/assets/icons/ycoin.svg';
import SirenIcon from '@/assets/icons/siren.svg';
import YPointIcon from '@/assets/icons/ypoint.svg';

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

  const {
    pointHistories,
    attendanceStreak,
    isAttendanceChecked,
    isAttendanceModalVisible,
    setIsAttendanceModalVisible,
    attendancePoints,
    attendedDays,
    pendingPoints,
    setPendingPoints,
    isClaiming,
    isClaimAnimating,
    handleClaimPoints,
    handleAttendanceCheck,
  } = useHomePointsData({ topToggle });

  // 차량 목록 로드
  useEffect(() => {
    if (accessToken) {
      loadMyCars();
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
        await loadProfile();
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
              <HomeTodayDriveSection
                todayRecords={todayRecords}
                expandedDriveIndices={expandedDriveIndices}
                onToggleExpand={(index) => {
                  setExpandedDriveIndices((prev) => {
                    const next = new Set(prev);
                    if (next.has(index)) next.delete(index);
                    else next.add(index);
                    return next;
                  });
                }}
              />

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

              <HomeAttendanceSection
                attendanceStreak={attendanceStreak}
                isAttendanceChecked={isAttendanceChecked}
                attendedDays={attendedDays}
                onAttendanceCheck={handleAttendanceCheck}
              />

              {/* 구분선 */}
              <View style={{ height: 28, backgroundColor: colors.coolNeutral[20], marginHorizontal: -20 }} />

              {/* 최근 포인트 */}
              <HomeRecentPointsSection
                pointHistories={pointHistories}
                onPressMore={() => router.push({ pathname: '/store', params: { tab: 'point' } })}
              />
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

      <HomeAttendanceRewardModal
        visible={isAttendanceModalVisible}
        attendancePoints={attendancePoints}
        attendanceStreak={attendanceStreak}
        onClose={() => setIsAttendanceModalVisible(false)}
      />

      <HomeStopDrivingModal
        visible={isStopModalVisible}
        isSaving={isSaving}
        totalDistanceKm={totalDistanceKm}
        elapsedTimeText={formatElapsedTime(elapsedSeconds)}
        estimatedPoints={estimatedPoints}
        onRequestClose={handleCancelStop}
        onCancel={handleCancelStop}
        onConfirm={handleConfirmStop}
      />

      {/* 블루투스 설정 모달 */}
      <HomeBluetoothSettingsModal
        visible={isBtModalVisible}
        onClose={() => {
          stopScan();
          setIsBtModalVisible(false);
        }}
        isMonitoring={isMonitoring}
        activeDeviceId={activeDeviceId}
        connectedDevice={connectedDevice}
        classicAudioDevice={classicAudioDevice}
        autoStartEnabled={autoStartEnabled}
        onSetAutoStartEnabled={setAutoStartEnabled}
        pairedDevices={pairedDevices}
        onSetActiveDevice={setActiveDevice}
        onRemovePairedDevice={removePairedDevice}
        hasClassicBt={hasClassicBt}
        onPairClassicDevice={handlePairClassicDevice}
        isBleAvailable={isBleAvailable}
        isBluetoothEnabled={isBluetoothEnabled}
        isScanning={isScanning}
        nearbyDevices={nearbyDevices}
        onStartScan={startScan}
        onStopScan={stopScan}
        onPairDevice={handlePairDevice}
        btError={btError}
      />

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
