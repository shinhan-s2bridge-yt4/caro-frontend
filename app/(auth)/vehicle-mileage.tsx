import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { colors, typography, borderRadius } from '@/theme';
import ProgressBar from '@/components/common/Bar/ProgressBar';
import NumberInput from '@/components/common/Input/NumberInput';
import { MainButton } from '@/components/common/Button/MainButton';
import { useSignupDraftStore } from '@/stores/signupDraftStore';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';

const SCREEN_MAX_WIDTH = 375;
const DEFAULT_MILEAGE = 10_000;

function onlyDigits(value: string) {
  return value.replace(/[^\d]/g, '');
}

export default function VehicleMileageScreen() {
  const router = useRouter();
  const updateVehicle = useSignupDraftStore((s) => s.updateVehicle);
  const vehicle = useSignupDraftStore((s) => s.vehicle);

  const [mileage, setMileage] = useState('');
  const [mileageError, setMileageError] = useState<string | undefined>();

  const mileageNumber = useMemo(() => {
    const digits = onlyDigits(mileage);
    return digits ? Number(digits) : DEFAULT_MILEAGE;
  }, [mileage]);

  const validate = (value: string) => {
    const digits = onlyDigits(value);
    if (!digits) return undefined; // 입력 안 하면 기본값으로 진행
    if (digits.length > 7) return '주행거리가 너무 커요.';
    return undefined;
  };

  const handleNext = () => {
    const err = validate(mileage);
    if (err) {
      setMileageError(err);
      return;
    }

    updateVehicle({
      brandId: vehicle.brandId,
      brandName: vehicle.brandName,
      modelId: vehicle.modelId,
      modelName: vehicle.modelName,
      modelVariant: vehicle.modelVariant,
      modelStartYear: vehicle.modelStartYear,
      modelEndYear: vehicle.modelEndYear,
      registrationNumber: vehicle.registrationNumber,
      mileage: mileageNumber,
    });
    router.push('/(auth)/vehicle-complete');
  };

  const handleSkip = () => {
    updateVehicle({
      brandId: vehicle.brandId,
      brandName: vehicle.brandName,
      modelId: vehicle.modelId,
      modelName: vehicle.modelName,
      modelVariant: vehicle.modelVariant,
      modelStartYear: vehicle.modelStartYear,
      modelEndYear: vehicle.modelEndYear,
      registrationNumber: vehicle.registrationNumber,
      mileage: DEFAULT_MILEAGE,
    });
    router.push('/(auth)/vehicle-complete');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.coolNeutral[10] }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
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

            {/* 타이틀 */}
            <View style={{ marginTop: 46, paddingHorizontal: 20 }}>
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.h2Semibold,
                  color: colors.coolNeutral[80],
                }}
              >
                현재 주행거리를 {'\n'}알려주세요
              </Text>
            </View>

            {/* 입력 */}
            <View style={{ marginTop: 49, alignItems: 'center' }}>
              <NumberInput
                label="주행거리"
                value={mileage}
                completed={onlyDigits(mileage).length > 0}
                onChangeText={(v) => {
                  setMileage(onlyDigits(v));
                  setMileageError(undefined);
                }}
                onBlur={() => setMileageError(validate(mileage))}
                placeholder="주행거리를 입력해주세요."
                unitLabel="km"
                onClear={() => {
                  setMileage('');
                  setMileageError(undefined);
                }}
                error={mileageError}
              />

              <View style={{ width: 334, marginTop: 12 }}>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.captionMedium,
                    color: colors.coolNeutral[40],
                  }}
                >
                  계기판에 표시된 총 주행거리를 입력해주세요.{'\n'}
                  입력하지 않으면 {DEFAULT_MILEAGE.toLocaleString('ko-KR')}km로
                  시작돼요.
                </Text>
              </View>
            </View>

            {/* 하단 버튼 */}
            <View style={{ flex: 1 }} />
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <MainButton label="다음" alwaysPrimary onPress={handleNext} />
              <Pressable
                onPress={handleSkip}
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
                  건너뛰기
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

