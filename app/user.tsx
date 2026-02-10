import React, { useState, useEffect } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { borderRadius, colors, typography } from '@/theme';
import { NavigationBar } from '@/components/common/Bar/NavigationBar';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';
import { useSignupDraftStore } from '@/stores/signupDraftStore';
import { useMyCarStore } from '@/stores/myCarStore';
import { fetchDashboard, type DashboardData } from '@/services/profileService';
import TextInput from '@/components/common/Input/TextInput';

import ArrowLeftIcon from '../assets/icons/arrow-left.svg';
import PencilIcon from '../assets/icons/pencil.svg';
import GRightIcon from '../assets/icons/GRightIcon.svg';
import XIcon from '../assets/icons/x_icon.svg';
import DownIcon from '../assets/icons/DownIcon.svg';
import PlusIcon from '../assets/icons/plus.svg';
import BCheckIcon from '../assets/icons/bcheck.svg';
import PointIcon from '../assets/icons/point.svg';

const SCREEN_MAX_WIDTH = 375;

export default function UserScreen() {
  const router = useRouter();
  const { logout, isLoggingOut } = useAuth();
  const accessToken = useAuthStore((state) => state.accessToken);
  const { name, email, primaryCar, loadProfile } = useProfileStore();
  const { cars, loadMyCars } = useMyCarStore();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCarNumberFocused, setIsCarNumberFocused] = useState(false);
  const [isCarModelDropdownOpen, setIsCarModelDropdownOpen] = useState(false);
  
  // API에서 프로필 데이터, 대시보드, 차량 목록 로드
  useEffect(() => {
    if (accessToken) {
      loadProfile(accessToken);
      fetchDashboard().then(setDashboard).catch(() => {});
      loadMyCars(accessToken);
    }
  }, [accessToken, loadProfile, loadMyCars]);
  
  // 화면 표시용 프로필 데이터
  const profileData = {
    name: name || '사용자',
    email: email || '',
    carModel: primaryCar ? `${primaryCar.brandName} ${primaryCar.modelName}` : '',
    carNumber: primaryCar?.registrationNumber || '',
  };
  
  // 수정 중인 데이터 상태
  const [editData, setEditData] = useState({
    name: '',
    selectedCarId: null as number | null,
    carNumber: '',
  });

  // 현재 선택된 차량 정보
  const selectedEditCar = cars.find((c) => c.id === editData.selectedCarId) || null;

  const handleOpenEditModal = () => {
    setEditData({
      name: profileData.name,
      selectedCarId: primaryCar?.id ?? (cars.length > 0 ? cars[0].id : null),
      carNumber: primaryCar?.registrationNumber || '',
    });
    setIsEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
    setIsCarModelDropdownOpen(false);
  };

  const { setProfile, updateProfile } = useProfileStore();
  const { setMode, clearDraft } = useSignupDraftStore();
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSaveProfile = async () => {
    if (!accessToken) return;
    
    // 변경된 필드만 request body에 포함
    const request: { name?: string; car?: { id: number; registrationNumber: string } } = {};
    
    const originalName = name || '사용자';
    if (editData.name !== originalName) {
      request.name = editData.name;
    }
    
    const originalCarId = primaryCar?.id;
    const originalCarNumber = primaryCar?.registrationNumber || '';
    if (
      editData.selectedCarId &&
      (editData.selectedCarId !== originalCarId || editData.carNumber !== originalCarNumber)
    ) {
      request.car = {
        id: editData.selectedCarId,
        registrationNumber: editData.carNumber,
      };
    }
    
    // 변경사항이 없으면 모달만 닫기
    if (Object.keys(request).length === 0) {
      setIsEditModalVisible(false);
      return;
    }
    
    setIsSaving(true);
    try {
      await updateProfile(accessToken, request);
      // 프로필 + 차량 목록 다시 로드하여 최신 상태 반영
      await Promise.all([
        loadProfile(accessToken),
        loadMyCars(accessToken),
      ]);
      setIsEditModalVisible(false);
    } catch (e) {
      Alert.alert('수정 실패', '프로필 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNewVehicle = () => {
    // 모달 닫기
    setIsEditModalVisible(false);
    setIsCarModelDropdownOpen(false);
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

      {/* 프로필 수정 모달 (Bottom Sheet) */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="none"
        onRequestClose={handleCloseEditModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          enabled={isCarNumberFocused}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.32)', justifyContent: 'flex-end' }}>
            <Pressable
              onPress={Keyboard.dismiss}
              style={{
                width: '100%',
                maxHeight: '90%',
                backgroundColor: colors.coolNeutral[10],
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }}
            >
              <ScrollView
                contentContainerStyle={{
                  paddingTop: 18,
                  paddingBottom: 24,
                  paddingHorizontal: 20,
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
            {/* 모달 헤더 */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body1Semibold,
                  color: colors.coolNeutral[80],
                }}
              >
                프로필 수정
              </Text>
              <Pressable
                onPress={handleCloseEditModal}
                style={{ alignItems: 'center', justifyContent: 'center' }}
                accessibilityRole="button"
                accessibilityLabel="close-modal"
              >
                <XIcon width={24} height={24} />
              </Pressable>
            </View>

            {/* 이름 필드 */}
            <View style={{ marginBottom: 20 }}>
              <TextInput
                label="이름"
                value={editData.name}
                onChangeText={(text) => setEditData({ ...editData, name: text })}
                onClear={() => setEditData({ ...editData, name: '' })}
                onBlur={() => {
                  if (!editData.name.trim()) {
                    setEditData({ ...editData, name: profileData.name });
                  }
                }}
              />
            </View>

            {/* 이메일 필드 (비활성화) */}
            <View style={{ marginBottom: 20 }}>
              <TextInput
                label="이메일"
                value={profileData.email}
                disabled
              />
            </View>

            {/* 차종 필드 */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body2Semibold,
                  color: colors.coolNeutral[80],
                  marginBottom: 12,
                }}
              >
                차종
              </Text>
              <Pressable
                onPress={() => setIsCarModelDropdownOpen(!isCarModelDropdownOpen)}
                style={{
                  height: 48,
                  borderWidth: 1.2,
                  borderColor: colors.coolNeutral[20],
                  borderRadius: borderRadius.md,
                  paddingHorizontal: 12,
                  paddingRight: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: colors.coolNeutral[10],
                }}
              >
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.body2Regular,
                    color: colors.coolNeutral[70],
                  }}
                >
                  {selectedEditCar ? `${selectedEditCar.brandName} ${selectedEditCar.modelName}` : '차량을 선택해주세요'}
                </Text>
                <DownIcon width={20} height={20} />
              </Pressable>

              {/* 차종 드롭다운 */}
              {isCarModelDropdownOpen && (
                <View
                  style={{
                    marginTop: 8,
                    borderWidth: 1,
                    borderColor: colors.coolNeutral[20],
                    borderRadius: borderRadius.md,
                    backgroundColor: colors.coolNeutral[10],
                    overflow: 'hidden',
                  }}
                >
                  {/* 새로운 차 추가하기 */}
                  <Pressable
                    onPress={handleAddNewVehicle}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.coolNeutral[20],
                    }}
                  >
                    <PlusIcon width={20} height={20} />
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body2Semibold,
                        color: colors.primary[50],
                      }}
                    >
                      새로운 차 추가하기
                    </Text>
                  </Pressable>

                  {/* 보유 차량 목록 */}
                  {cars.map((car) => {
                    const isSelected = car.id === editData.selectedCarId;
                    return (
                      <Pressable
                        key={car.id}
                        onPress={() => {
                          setEditData({
                            ...editData,
                            selectedCarId: car.id,
                            carNumber: car.registrationNumber,
                          });
                          setIsCarModelDropdownOpen(false);
                        }}
                        style={{
                          paddingVertical: 14,
                          paddingHorizontal: 16,
                          backgroundColor: isSelected ? colors.primary[10] : 'transparent',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <View style={{ gap: 2 }}>
                          <Text
                            style={{
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.body2Regular,
                              color: isSelected ? colors.primary[50] : colors.coolNeutral[70],
                            }}
                          >
                            {car.brandName} {car.modelName}
                          </Text>
                          <Text
                            style={{
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.body3Regular,
                              color: isSelected ? colors.primary[40] : colors.coolNeutral[40],
                            }}
                          >
                            {car.registrationNumber}
                          </Text>
                        </View>
                        {isSelected && <BCheckIcon width={16} height={16} />}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            {/* 차량번호 필드 */}
            <View style={{ marginBottom: 24 }}>
              <TextInput
                label="차량번호"
                value={editData.carNumber}
                onChangeText={(text) => setEditData({ ...editData, carNumber: text })}
                onClear={() => setEditData({ ...editData, carNumber: '' })}
                onFocus={() => setIsCarNumberFocused(true)}
                onBlur={() => {
                  setIsCarNumberFocused(false);
                  if (!editData.carNumber.trim()) {
                    setEditData({ ...editData, carNumber: selectedEditCar?.registrationNumber || '' });
                  }
                }}
              />
            </View>

            {/* 버튼 영역 */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {/* 취소 버튼 */}
              <Pressable
                onPress={handleCloseEditModal}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.background.default,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.body1Semibold,
                    color: colors.coolNeutral[50],
                  }}
                >
                  취소
                </Text>
              </Pressable>

              {/* 저장하기 버튼 */}
              <Pressable
                onPress={handleSaveProfile}
                disabled={isSaving}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: borderRadius.md,
                  backgroundColor: isSaving ? colors.coolNeutral[30] : colors.primary[50],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.body1Semibold,
                    color: colors.coolNeutral[10],
                  }}
                >
                  {isSaving ? '저장 중...' : '저장하기'}
                </Text>
              </Pressable>
            </View>
              </ScrollView>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

