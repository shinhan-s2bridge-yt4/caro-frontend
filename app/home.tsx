import { Pressable, View, Text, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography } from '@/theme';
import { NavigationBar } from '@/components/common/Bar/NavigationBar';
import { ToggleButton, type ToggleOption, type ToggleValue } from '@/components/common/Button/ToggleButton';
import { Toast } from '@/components/common/Toast/Toast';
import { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDrivingStore, formatElapsedTime, formatDistance } from '@/stores/drivingStore';
import { useDriveTracking } from '@/hooks/useDriveTracking';
import { useProfileStore } from '@/stores/profileStore';

import BCarIcon from '../assets/icons/bcar.svg';
import CarOcarIcon from '../assets/icons/carocar.svg';
import RightIcon from '../assets/icons/RightIcon.svg';
import HandIcon from '../assets/icons/hand.svg';
import PlayIcon from '../assets/icons/play.svg';
import PauseIcon from '../assets/icons/pause.svg';
import BCoinIcon from '../assets/icons/bcoin.svg';
import XIcon from '../assets/icons/x_icon.svg';
import PointIcon from '../assets/icons/point.svg';

export default function HomeScreen() {
  const router = useRouter();
  const [topToggle, setTopToggle] = useState<ToggleValue>(0);
  const [isStopModalVisible, setIsStopModalVisible] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);

  // 운행 상태 관리
  const {
    status: drivingStatus,
    elapsedSeconds,
    totalDistanceKm,
    startDriving,
    stopDriving,
  } = useDrivingStore();

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
      return '운행중';
    }
    return '운행 대기중';
  }, [drivingStatus]);

  // 운행 상태에 따른 상태 표시 색상
  const statusColor = useMemo(() => {
    if (drivingStatus === 'driving') return colors.red[40]; // 운행 중 - 빨간색
    return colors.coolNeutral[40];
  }, [drivingStatus]);

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

  // 운행 종료 확인
  const handleConfirmStop = () => {
    stopDriving();
    setIsStopModalVisible(false);
    setIsToastVisible(true);
  };

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

  // 프로필 스토어에서 이름 가져오기
  const userName = useProfileStore((s) => s.name) || '사용자';

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background.default }}>
    <View style={{ flex: 1, backgroundColor: colors.background.default }}>
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
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: colors.red[40],
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
                  종료하기
                </Text>
              </Pressable>
              </View>
            </View>
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
        duration={3000}
      />
    </View>
    </SafeAreaView>
  );
}
