import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { borderRadius, colors, typography } from '@/theme';
import { NavigationBar } from '@/components/common/Bar/NavigationBar';
import { useAuth } from '@/hooks/useAuth';

import ArrowLeftIcon from '../assets/icons/arrow-left.svg';
import PencilIcon from '../assets/icons/pencil.svg';
import GRightIcon from '../assets/icons/GRightIcon.svg';

const SCREEN_MAX_WIDTH = 375;

export default function UserScreen() {
  const router = useRouter();
  const { logout, isLoggingOut } = useAuth();

  const handleLogoutPress = () => {
    if (isLoggingOut) return;

    Alert.alert('로그아웃', '로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: () => {
          (async () => {
            await logout();
            router.replace('/login');
          })();
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background.default }}>
      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ alignItems: 'stretch' }}
      >
        <View
          style={{
            width: '100%',
            backgroundColor: colors.background.default,
            paddingTop: 12,
            gap: 43,
          }}
        >
          {/* 여기까지: background.default */}
          <View style={{ width: '100%', maxWidth: SCREEN_MAX_WIDTH, alignSelf: 'center', gap: 23 }}>
            {/* 헤더 */}
            <View
              style={{
                paddingVertical: 12,
                paddingHorizontal: 20,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Pressable
                onPress={() => router.back()}
                style={{ width: 24, height: 24, justifyContent: 'center' }}
                accessibilityRole="button"
                accessibilityLabel="back"
              >
                <ArrowLeftIcon width={24} height={24} />
              </Pressable>

              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body1Semibold,
                  color: colors.coolNeutral[90],
                }}
              >
                마이페이지
              </Text>
            </View>

            {/* 프로필 카드 */}
            <View style={{ paddingHorizontal: 20 }}>
              <View
                style={{
                  width: '100%',
                  borderRadius: borderRadius.lg,
                  backgroundColor: colors.coolNeutral[10],
                  paddingTop: 24,
                  overflow: 'hidden',
                }}
              >
                <View style={{ paddingHorizontal: 20, paddingBottom: 12, gap: 10 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body1Bold,
                          color: colors.coolNeutral[90],
                        }}
                      >
                        김신한
                      </Text>
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body2Regular,
                          color: colors.coolNeutral[40],
                        }}
                      >
                        shinhan@shinhan.net
                      </Text>
                    </View>

                    <Pressable
                      onPress={() => {}}
                      accessibilityRole="button"
                      accessibilityLabel="edit-profile"
                      style={{
                        width: 28,
                        height: 28,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PencilIcon width={20} height={20} />
                    </Pressable>
                  </View>

                  <View>
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body2Semibold,
                        color: colors.primary[50],
                      }}
                    >
                      디 올 뉴 그랜저(GN7)  {'|'}  123 가 4568
                    </Text>
                  </View>
                </View>

                {/* 통계 바 */}
                <View
                  style={{
                    width: '100%',
                    backgroundColor: colors.primary[50],
                    paddingVertical: 24,
                    paddingHorizontal: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <View style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body1Semibold,
                        color: colors.coolNeutral[10],
                      }}
                    >
                      163.0 km
                    </Text>
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.captionRegular,
                        color: 'rgba(255,255,255,0.8)',
                      }}
                    >
                      총 운행거리
                    </Text>
                  </View>

                  <View
                    style={{
                      width: 1,
                      height: 63,
                      backgroundColor: 'rgba(255,255,255,0.4)',
                    }}
                  />

                  <View style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body1Semibold,
                        color: colors.coolNeutral[10],
                      }}
                    >
                      1,605P
                    </Text>
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.captionRegular,
                        color: 'rgba(255,255,255,0.8)',
                      }}
                    >
                      총 적립 포인트
                    </Text>
                  </View>

                  <View
                    style={{
                      width: 1,
                      height: 63,
                      backgroundColor: 'rgba(255,255,255,0.4)',
                    }}
                  />

                  <View style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body1Semibold,
                        color: colors.coolNeutral[10],
                      }}
                    >
                      23
                    </Text>
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.captionRegular,
                        color: 'rgba(255,255,255,0.8)',
                      }}
                    >
                      운행 횟수
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* 아래부터: coolNeutral[10] */}
          <View style={{ width: '100%', backgroundColor: colors.coolNeutral[10] }}>
            <View style={{ width: '100%', maxWidth: SCREEN_MAX_WIDTH, alignSelf: 'center' }}>
              <View style={{ paddingVertical: 32, paddingHorizontal: 20 }}>
                {/* 메뉴 리스트 */}
                <View>
                  {[
                    '설정',
                    '알림 설정',
                    '개인정보 보호',
                    '도움말 및 지원',
                    '이용약관',
                    '로그아웃',
                  ].flatMap((label, idx, arr) => {
                    const row = (
                      <Pressable
                        key={label}
                        onPress={label === '로그아웃' ? handleLogoutPress : () => {}}
                        accessibilityRole="button"
                        accessibilityLabel={`mypage-${label}`}
                        style={{
                          paddingTop: 10,
                          paddingBottom: 24,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: colors.coolNeutral[10],
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body1Semibold,
                            color: colors.coolNeutral[90],
                          }}
                        >
                          {label}
                        </Text>
                        <GRightIcon width={24} height={24} />
                      </Pressable>
                    );

                    if (idx === arr.length - 1) return [row];

                    return [
                      row,
                      <View
                        key={`sep-${label}`}
                        style={{ width: '100%', height: 1, backgroundColor: colors.coolNeutral[30] }}
                      />,
                      <View key={`sep-gap-${label}`} style={{ height: 20 }} />,
                    ];
                  })}
                </View>

                <View style={{ alignItems: 'center', paddingTop: 20 }}>
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.captionLight,
                      color: colors.coolNeutral[40],
                    }}
                  >
                    앱 버전 1.0.0
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={{ width: '100%', backgroundColor: colors.coolNeutral[10] }}>
        <NavigationBar
          active="user"
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

