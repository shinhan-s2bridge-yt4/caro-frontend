import { Pressable, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography } from '@/theme';
import { NavigationBar } from '@/components/common/Bar/NavigationBar';
import { ToggleButton, type ToggleOption, type ToggleValue } from '@/components/common/Button/ToggleButton';
import { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import BCarIcon from '../assets/icons/bcar.svg';
import CoinIcon from '../assets/icons/coin.svg';
import CarOcarIcon from '../assets/icons/carocar.svg';
import RightIcon from '../assets/icons/RightIcon.svg';
import HandIcon from '../assets/icons/hand.svg';
import PlayIcon from '../assets/icons/play.svg';

export default function HomeScreen() {
  const router = useRouter();
  const [topToggle, setTopToggle] = useState<ToggleValue>(0);

  const toggleOptions = useMemo((): [ToggleOption, ToggleOption] => {
    return [
      { label: '운행기록', icon: BCarIcon, activeIcon: BCarIcon },
      { label: '포인트', icon: CoinIcon, activeIcon: CoinIcon },
    ];
  }, []);

  // TODO: 실제 유저 이름 연동 시 교체
  const userName = '신한';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.default }}>
    <View style={{ flex: 1, backgroundColor: colors.background.default }}>
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 375,
          alignSelf: 'center',
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
                  ...typography.styles.body3Medium,
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
                        ...typography.styles.body1Bold,
                        color: colors.coolNeutral[80],
                      }}
                    >
                      오늘의 운행
                    </Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: colors.coolNeutral[40] }} />
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.captionMedium,
                          color: colors.coolNeutral[50],
                        }}
                      >
                        운행 대기중
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
                          ...typography.styles.captionMedium,
                          color: colors.coolNeutral[50],
                        }}
                      >
                        주행거리
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.h1Bold,
                            color: colors.primary[70],
                            letterSpacing: typography.letterSpacing.tightest,
                          }}
                        >
                          0
                        </Text>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body2Bold,
                            color: colors.primary[70],
                            paddingBottom: 6,
                          }}
                        >
                          km
                        </Text>
                      </View>
                    </View>

                    <View style={{ gap: 6 }}>
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.captionMedium,
                          color: colors.coolNeutral[50],
                        }}
                      >
                        운행시간
                      </Text>
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.h1Bold,
                          color: colors.primary[70],
                          letterSpacing: typography.letterSpacing.tightest,
                        }}
                      >
                        00:00:00
                      </Text>
                    </View>
                  </View>

                  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <CarOcarIcon width={110} height={110} />
                  </View>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="start-driving"
                  onPress={() => {
                    // TODO: 운행 시작 기능 연결 시 교체
                  }}
                  style={{
                    marginTop: 18,
                    height: 54,
                    borderRadius: 16,
                    backgroundColor: colors.primary[50],
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: 12,
                    paddingHorizontal: 28,
                    paddingVertical: 12,
                  }}
                >
                  {/* Play icon */}
                  <PlayIcon width={24} height={24} />
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.body2Bold,
                      color: colors.coolNeutral[10],
                    }}
                  >
                    운행 시작하기
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
                      ...typography.styles.body2Bold,
                      color: colors.primary[70],
                    }}
                  >
                    친구 초대하고 1000P 받기!
                  </Text>
                </View>
                <RightIcon width={24} height={24} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>

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
    </SafeAreaView>
  );
}