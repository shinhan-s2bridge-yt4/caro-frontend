import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { colors, typography } from '@/theme';
import FormStepLayout from '@/components/common/Layout/FormStepLayout';
import NumberInput from '@/components/common/Input/NumberInput';
import { MainButton } from '@/components/common/Button/MainButton';
import { SecondaryButton } from '@/components/common/Button/SecondaryButton';
import { useSignupDraftStore } from '@/stores/signupDraftStore';
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FormStepLayout
        onBack={() => router.back()}
        title={'현재 주행거리를 \n알려주세요'}
        activeStepIndex={4}
        keyboardShouldPersistTaps="handled"
        bodyMarginTop={49}
        footer={(
          <>
            <MainButton label="다음" alwaysPrimary onPress={handleNext} />
            <SecondaryButton
              label="건너뛰기"
              onPress={handleSkip}
              containerStyle={{ marginTop: 12 }}
            />
          </>
        )}
      >
        <View style={{ alignItems: 'center' }}>
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
      </FormStepLayout>
    </KeyboardAvoidingView>
  );
}

