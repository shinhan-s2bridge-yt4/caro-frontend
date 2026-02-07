import { Pressable, View, Text, Modal, ActivityIndicator, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography } from '@/theme';
import { NavigationBar } from '@/components/common/Bar/NavigationBar';
import { ToggleButton, type ToggleOption, type ToggleValue } from '@/components/common/Button/ToggleButton';
import { Toast } from '@/components/common/Toast/Toast';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useDrivingStore, formatElapsedTime, formatDistance } from '@/stores/drivingStore';
import { useDriveTracking, reverseGeocodeToAddress } from '@/hooks/useDriveTracking';
import { useBluetoothConnection, type BleDevice } from '@/hooks/useBluetoothConnection';
import { useBluetoothSettingsStore } from '@/stores/bluetoothSettingsStore';
import { useProfileStore } from '@/stores/profileStore';
import { useMyCarStore } from '@/stores/myCarStore';
import { useAuthStore } from '@/stores/authStore';
import { createDrivingRecord } from '@/services/drivingRecordService';

import BCarIcon from '../assets/icons/bcar.svg';
import GCarIcon from '../assets/icons/gcar.svg';
import CarOcarIcon from '../assets/icons/carocar.svg';
import RightIcon from '../assets/icons/RightIcon.svg';
import HandIcon from '../assets/icons/hand.svg';
import PlayIcon from '../assets/icons/play.svg';
import PauseIcon from '../assets/icons/pause.svg';
import BCoinIcon from '../assets/icons/bcoin.svg';
import XIcon from '../assets/icons/x_icon.svg';
import PointIcon from '../assets/icons/point.svg';
import InfoIcon from '../assets/icons/info.svg';
import BCheckIcon from '../assets/icons/bcheck.svg';
import GCheckIcon from '../assets/icons/gcheck.svg';
import WXIcon from '../assets/icons/w_x.svg';

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

  // 예상 적립 포인트 계산 (1km당 약 1.5P)
  const estimatedPoints = useMemo(() => {
    return Math.floor(totalDistanceKm * 1.5);
  }, [totalDistanceKm]);

  // 수동 운행 시작/중지 핸들러
  const handleDrivingToggle = async () => {
    if (drivingStatus === 'driving') {
      // 운행 중이면 종료 확인 팝업 표시
      setIsStopModalVisible(true);
    } else {
      // GPS 권한이 없으면 요청
      if (!hasPermission) {
        const granted = await requestPermissions();
        if (!granted) return;
      }
      startDriving();
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
        const currentPos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        endLocationName = await reverseGeocodeToAddress(
          currentPos.coords.latitude,
          currentPos.coords.longitude,
        );
      } catch {
        console.warn('종료 위치 역지오코딩 실패');
      }

      // 날짜/시간 포맷팅
      const pad = (n: number) => String(n).padStart(2, '0');
      const driveDate = `${startDate.getFullYear()}-${pad(startDate.getMonth() + 1)}-${pad(startDate.getDate())}`;
      const startTimeStr = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}:${pad(startDate.getSeconds())}`;
      const endTimeStr = `${pad(endTime.getHours())}:${pad(endTime.getMinutes())}:${pad(endTime.getSeconds())}`;

      // API 호출
      if (accessToken && selectedCarId) {
        const requestBody = {
          memberCarId: selectedCarId,
          driveDate,
          startTime: startTimeStr,
          endTime: endTimeStr,
          distanceKm: Math.round(distance * 100) / 100,
          startLocation: startLoc || '알 수 없는 위치',
          endLocation: endLocationName,
        };
        console.log('운행 기록 저장 요청:', JSON.stringify(requestBody, null, 2));

        await createDrivingRecord({
          request: requestBody,
          accessToken,
        });
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
      { label: '포인트', icon: BCoinIcon, activeIcon: BCoinIcon },
    ];
  }, []);

  // 현재 선택된 차량 정보
  const selectedCar = useMemo(() => {
    if (cars.length === 0) return null;
    return cars.find((car) => car.id === selectedCarId) || cars[0];
  }, [cars, selectedCarId]);

  // 차량 선택 핸들러
  const handleCarSelect = (carId: number) => {
    setSelectedCarId(carId);
    setIsCarSelectModalVisible(false);
  };

  // 프로필 스토어에서 이름 가져오기
  const userName = useProfileStore((s) => s.name) || '사용자';

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background.default }}>
    <View style={{ flex: 1, backgroundColor: colors.background.default }}>
      {/* 드롭다운 열려있을 때 배경 터치로 닫기 */}
      {isCarSelectModalVisible && (
        <Pressable
          onPress={() => setIsCarSelectModalVisible(false)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5,
          }}
          accessibilityRole="button"
          accessibilityLabel="dismiss-car-dropdown"
        />
      )}
      <View
        style={{
          flex: 1,
          width: '100%',
        }}
      >
        <View style={{ gap: 20 }}>
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
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.h3Bold,
                color: colors.primary[50],
              }}
            >
              CARO
            </Text>
            <ToggleButton
              options={toggleOptions}
              value={topToggle}
              onChange={(v) => setTopToggle(v)}
              height={34}
            />
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

            <View style={{ gap: 24 }}>
              {/* Today Drive Card */}
              <View
                style={{
                  backgroundColor: colors.coolNeutral[10],
                  borderRadius: 20,
                  padding: 18,
                  shadowColor: '#000',
                  shadowOpacity: 0.06,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 3,
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
                <View style={{ marginTop: 12, position: 'relative' }}>
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
                      {selectedCar.brandName} {selectedCar.modelName}
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
                              paddingHorizontal: 12,
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
                                  width: 80,
                                  marginLeft: 8,
                                }}
                              >
                                {car.brandName} {car.modelName}
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

                  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <CarOcarIcon width={110} height={110} />
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

              {/* 블루투스 자동 운행 카드 */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="bluetooth-settings"
                onPress={() => setIsBtModalVisible(true)}
                style={{
                  backgroundColor: isMonitoring && activeDeviceId
                    ? colors.primary[10]
                    : colors.coolNeutral[10],
                  borderRadius: 18,
                  borderWidth: isMonitoring && activeDeviceId ? 1 : 0,
                  borderColor: colors.primary[30],
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  shadowColor: '#000',
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
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
                  height: 76,
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <HandIcon width={58} height={39} />
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.body1Bold,
                      color: colors.primary[70],
                    }}
                  >
                    친구 초대하고 1000P 받기 !
                  </Text>
                </View>
                <RightIcon width={24} height={24} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      <View style={{ width: '100%', backgroundColor: colors.coolNeutral[10] }}>
        <NavigationBar
          active="home"
          showBorder
          onPress={(tab) => {
            const to =
              tab === 'home'
                ? '/home'
                : tab === 'car'
                  ? '/car'
                  : tab === 'coin'
                    ? '/coin'
                    : tab === 'store'
                      ? '/store'
                      : '/user';
            router.push(to);
          }}
        />
      </View>

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
        animationType="slide"
        onRequestClose={() => setIsBtModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.32)', justifyContent: 'flex-end' }}>
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

              {/* 현재 연결된 Classic BT 오디오 디바이스 */}
              {classicAudioDevice && (
                <View style={{ paddingVertical: 16, gap: 8, borderBottomWidth: 1, borderBottomColor: colors.coolNeutral[20] }}>
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.body2Bold,
                      color: colors.coolNeutral[60],
                    }}
                  >
                    현재 연결된 블루투스 오디오
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: colors.primary[10],
                      borderRadius: 12,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: colors.primary[30],
                    }}
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            backgroundColor: colors.primary[50],
                          }}
                        />
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body2Bold,
                            color: colors.primary[60],
                          }}
                        >
                          {classicAudioDevice.name}
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
                        {pairedDevices.some((d) => d.id === classicAudioDevice.id)
                          ? '등록됨'
                          : '연결됨 · 등록하면 자동 운행 시작'}
                      </Text>
                    </View>
                    {!pairedDevices.some((d) => d.id === classicAudioDevice.id) && (
                      <Pressable
                        onPress={handlePairClassicDevice}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 10,
                          backgroundColor: colors.primary[50],
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="register-classic-bt"
                      >
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body3Semibold,
                            color: colors.coolNeutral[10],
                          }}
                        >
                          등록
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              )}

              {/* 등록된 디바이스 목록 */}
              {pairedDevices.length > 0 && (
                <View style={{ paddingVertical: 16, gap: 8 }}>
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.body2Bold,
                      color: colors.coolNeutral[60],
                    }}
                  >
                    등록된 차량 블루투스
                  </Text>
                  {pairedDevices.map((device) => (
                    <View
                      key={device.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor:
                          device.id === activeDeviceId
                            ? colors.primary[10]
                            : colors.background.default,
                        borderRadius: 12,
                        padding: 14,
                        borderWidth: device.id === activeDeviceId ? 1 : 0,
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
                              backgroundColor:
                                connectedDevice?.id === device.id
                                  ? colors.primary[50]
                                  : colors.coolNeutral[30],
                            }}
                          />
                          <Text
                            style={{
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.body2Bold,
                              color:
                                device.id === activeDeviceId
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
                            color: colors.coolNeutral[40],
                            marginLeft: 16,
                          }}
                        >
                          {connectedDevice?.id === device.id
                            ? '연결됨'
                            : device.id === activeDeviceId
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
                  ))}
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
