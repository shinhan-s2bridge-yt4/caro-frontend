import React, { useState, useEffect } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { borderRadius, colors, typography } from '@/theme';
import { NavigationBar } from '@/components/common/Bar/NavigationBar';
import { USER_MENU_ITEMS, type UserMenuKey } from '@/components/user/constants/menuItems';
import { ProfileEditModal } from '@/components/user/modals/ProfileEditModal';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfileEdit } from '@/hooks/user/useUserProfileEdit';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';
import { useSignupDraftStore } from '@/stores/signupDraftStore';
import { useMyCarStore } from '@/stores/myCarStore';
import { fetchDashboard, type DashboardData } from '@/services/profileService';
import { getTabRoute } from '@/utils/navigation';

import ArrowLeftIcon from '@/assets/icons/arrow-left.svg';
import PencilIcon from '@/assets/icons/pencil.svg';
import GRightIcon from '@/assets/icons/GRightIcon.svg';
import PointIcon from '@/assets/icons/point.svg';

export default function UserScreen() {
  const router = useRouter();
  const { logout, isLoggingOut } = useAuth();
  const accessToken = useAuthStore((state) => state.accessToken);
  const { name, email, primaryCar, loadProfile } = useProfileStore();
  const { cars, loadMyCars } = useMyCarStore();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  
  // API에서 프로필 데이터, 대시보드, 차량 목록 로드
  useEffect(() => {
    if (accessToken) {
      loadProfile();
      fetchDashboard().then(setDashboard).catch(() => {});
      loadMyCars();
    }
  }, [accessToken, loadProfile, loadMyCars]);
  
  // 화면 표시용 프로필 데이터
  const profileData = {
    name: name || '사용자',
    email: email || '',
    carModel: primaryCar ? `${primaryCar.brandName} ${primaryCar.modelName} ${primaryCar.variant}` : '',
    carNumber: primaryCar?.registrationNumber || '',
  };
  
  const { updateProfile } = useProfileStore();
  const { setMode, clearDraft } = useSignupDraftStore();
  const {
    isEditModalVisible,
    editData,
    setEditData,
    isSaving,
    handleOpenEditModal,
    handleCloseEditModal,
    handleSaveProfile,
  } = useUserProfileEdit({
    accessToken,
    profileName: profileData.name,
    primaryCar,
    cars,
    loadProfile,
    loadMyCars,
    updateProfile,
  });

  const handleAddNewVehicle = () => {
    // 모달 닫기
    handleCloseEditModal();
    // 차량 추가 모드로 설정 후 플로우 시작
    clearDraft();
    setMode('add-vehicle');
    router.push('/(auth)/vehicle-brand');
  };

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

  const handleMenuPress = (menuKey: UserMenuKey) => {
    if (menuKey === 'logout') {
      handleLogoutPress();
      return;
    }
    if (menuKey === 'my-car') {
      router.push('/my-car');
      return;
    }
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
          <View style={{ width: '100%', gap: 23 }}>
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
                  ...typography.styles.h3Semibold,
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
                        {profileData.name}
                      </Text>
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body2Regular,
                          color: colors.coolNeutral[40],
                        }}
                      >
                        {profileData.email}
                      </Text>
                    </View>

                    <Pressable
                      onPress={handleOpenEditModal}
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
                      {profileData.carModel}  {'|'}  {profileData.carNumber}
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
                      {dashboard ? `${dashboard.totalDistanceKm.toFixed(1)} km` : '- km'}
                    </Text>
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body2Regular,
                        color: colors.coolNeutral[10],
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <PointIcon width={18} height={18} />
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body1Semibold,
                          color: colors.coolNeutral[10],
                        }}
                      >
                        {dashboard ? `${dashboard.availablePoints.toLocaleString()}` : '-'}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body2Regular,
                        color: colors.coolNeutral[10],
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
                      {dashboard ? `${dashboard.totalDrivingRecordCount}` : '-'}
                    </Text>
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body2Regular,
                        color: colors.coolNeutral[10],
                      }}
                    >
                      총 운행 횟수
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* 아래부터: coolNeutral[10] */}
          <View style={{ width: '100%', backgroundColor: colors.coolNeutral[10] }}>
            <View style={{ width: '100%' }}>
              <View style={{ paddingVertical: 32, paddingHorizontal: 20 }}>
                {/* 메뉴 리스트 */}
                <View>
                  {USER_MENU_ITEMS.flatMap(({ key, label }, idx, arr) => {
                    const row = (
                      <Pressable
                        key={key}
                        onPress={() => handleMenuPress(key)}
                        accessibilityRole="button"
                        accessibilityLabel={`mypage-${key}`}
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
                        key={`sep-${key}`}
                        style={{ width: '100%', height: 1, backgroundColor: colors.coolNeutral[30] }}
                      />,
                      <View key={`sep-gap-${key}`} style={{ height: 20 }} />,
                    ];
                  })}
                </View>

                <View style={{ alignItems: 'center', paddingTop: 20 }}>
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.body3Light,
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
          onPress={(tab) => router.push(getTabRoute(tab))}
        />
      </View>

      <ProfileEditModal
        visible={isEditModalVisible}
        editData={editData}
        setEditData={setEditData}
        profileName={profileData.name}
        profileEmail={profileData.email}
        cars={cars}
        isSaving={isSaving}
        onClose={handleCloseEditModal}
        onSave={handleSaveProfile}
        onAddNewVehicle={handleAddNewVehicle}
      />
    </SafeAreaView>
  );
}

