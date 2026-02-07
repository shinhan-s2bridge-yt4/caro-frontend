import { useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';

import { colors, typography, borderRadius } from '@/theme';
import ProgressBar from '@/components/common/Bar/ProgressBar';
import { MainButton } from '@/components/common/Button/MainButton';
import { formatNumberWithComma } from '@/utils/number';
import { signUpWithEmail } from '@/services/authService';
import { registerMyCar } from '@/services/vehicleService';
import { useAuthStore } from '@/stores/authStore';
import { useSignupDraftStore } from '@/stores/signupDraftStore';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';

const SCREEN_MAX_WIDTH = 375;

function pickYear(startYearStr?: string, endYearStr?: string) {
  const startYear = Number(startYearStr);
  const endYear = Number(endYearStr);
  if (Number.isFinite(endYear) && endYear > 0) return endYear;
  if (Number.isFinite(startYear) && startYear > 0) return startYear;
  return undefined;
}

export default function VehicleCompleteScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const mode = useSignupDraftStore((s) => s.mode);
  const account = useSignupDraftStore((s) => s.account);
  const vehicle = useSignupDraftStore((s) => s.vehicle);
  const clearDraft = useSignupDraftStore((s) => s.clearDraft);

  const viewTitle = useMemo(() => {
    return [vehicle.brandName, vehicle.modelName, vehicle.modelVariant]
      .filter(Boolean)
      .join(' ');
  }, [vehicle.brandName, vehicle.modelName, vehicle.modelVariant]);

  const viewYear = useMemo(() => {
    const s = vehicle.modelStartYear ? String(vehicle.modelStartYear) : undefined;
    const e = vehicle.modelEndYear ? String(vehicle.modelEndYear) : undefined;
    return pickYear(s, e);
  }, [vehicle.modelStartYear, vehicle.modelEndYear]);

  const viewMileageText = useMemo(() => {
    const m = vehicle.mileage;
    return Number.isFinite(m) ? formatNumberWithComma(String(m)) : '';
  }, [vehicle.mileage]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // 차량 정보 검증 (공통)
    if (
      vehicle.modelId == null ||
      !vehicle.registrationNumber ||
      vehicle.mileage == null
    ) {
      Alert.alert('차량 정보가 부족해요', '차량 정보를 다시 입력해주세요.');
      router.replace('/(auth)/vehicle-brand');
      return;
    }

    // 마이페이지에서 차량 추가 모드
    if (mode === 'add-vehicle') {
      if (!accessToken) {
        Alert.alert('로그인이 필요해요', '다시 로그인해주세요.');
        router.replace('/login');
        return;
      }

      try {
        setIsSubmitting(true);

        await registerMyCar({
          accessToken,
          payload: {
            modelId: vehicle.modelId,
            registrationNumber: vehicle.registrationNumber,
            mileage: vehicle.mileage,
          },
        });

        clearDraft();
        Alert.alert('차량 추가 완료', '새 차량이 추가되었습니다.');
        router.replace('/user');
      } catch (e: unknown) {
        const message =
          axios.isAxiosError(e) && e.response?.data?.message
            ? String(e.response.data.message)
            : e instanceof Error
              ? e.message
              : '차량 추가 중 오류가 발생했습니다.';
        Alert.alert('차량 추가 실패', message);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 회원가입 모드 (기존 로직)
    if (!account) {
      Alert.alert('회원가입 정보가 없어요', '처음 화면에서 다시 진행해주세요.');
      router.replace('/(auth)/signup');
      return;
    }

    try {
      setIsSubmitting(true);

      const auth = await signUpWithEmail({
        email: account.email,
        password: account.password,
        name: account.name,
      });
      setAuth(auth);

      await registerMyCar({
        accessToken: auth.accessToken,
        payload: {
          modelId: vehicle.modelId,
          registrationNumber: vehicle.registrationNumber,
          mileage: vehicle.mileage,
        },
      });

      clearDraft();
      router.replace('/home');
    } catch (e: unknown) {
      const message =
        axios.isAxiosError(e) && e.response?.data?.message
          ? String(e.response.data.message)
          : e instanceof Error
            ? e.message
            : '회원가입 중 오류가 발생했습니다.';
      Alert.alert('회원가입 실패', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.coolNeutral[10] }}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1, width: '100%', maxWidth: SCREEN_MAX_WIDTH }}>
          {/* 상단: 뒤로가기 */}
          <View style={{ paddingVertical: 12, paddingHorizontal: 20 }}>
            <Pressable
              onPress={() => router.back()}
              style={{ width: 24, height: 24, justifyContent: 'center' }}
            >
              <ArrowLeftIcon width={24} height={24} />
            </Pressable>
          </View>

          {/* 진행바 */}
          <View style={{ marginTop: 10, width: '100%', alignItems: 'center' }}>
            <ProgressBar total={5} activeIndex={4} />
          </View>

          {/* 중앙 콘텐츠 */}
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text
              style={{
                textAlign: 'center',
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.h2Semibold,
                color: colors.coolNeutral[80],
              }}
            >
              입력이 모두{'\n'}완료 되었습니다!
            </Text>

            <View
              style={{
                marginTop: 45,
                width: 334,
                borderRadius: borderRadius.lg,
                paddingVertical: 20,
                paddingHorizontal: 20,
                backgroundColor: colors.background.default,
              }}
            >
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body1Bold,
                  color: colors.primary[50],
                }}
              >
                {viewTitle || '차량 정보'}
              </Text>

              <View style={{ marginTop: 8.5, gap: 8 }}>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.body3Semibold,
                    color: colors.coolNeutral[60],
                  }}
                >
                  • 연식: {viewYear ? `${viewYear}년` : '-'}
                </Text>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.body3Semibold,
                    color: colors.coolNeutral[60],
                  }}
                >
                  • 주행거리: {viewMileageText ? `${viewMileageText}km` : '-'}
                </Text>
              </View>
            </View>
          </View>

          {/* 하단 버튼 */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <MainButton
              label={isSubmitting ? '처리 중...' : mode === 'add-vehicle' ? '등록하기' : '시작하기'}
              alwaysPrimary
              disabled={isSubmitting}
              onPress={handleSubmit}
            />
            <Pressable
              onPress={() => {
                if (mode === 'add-vehicle') {
                  clearDraft();
                  router.replace('/user');
                } else {
                  router.replace('/(auth)/vehicle-brand');
                }
              }}
              style={{
                marginTop: 12,
                width: 335,
                height: 48,
                borderRadius: borderRadius.md,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.coolNeutral[20],
              }}
            >
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body2Bold,
                  color: colors.coolNeutral[50],
                }}
              >
                {mode === 'add-vehicle' ? '취소' : '수정할래요'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

