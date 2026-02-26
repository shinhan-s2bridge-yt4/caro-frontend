import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import FormStepLayout from '@/components/common/Layout/FormStepLayout';
import TextInput from '@/components/common/Input/TextInput';
import { MainButton } from '@/components/common/Button/MainButton';
import { useSignupDraftStore } from '@/stores/signupDraftStore';

export default function VehicleNumberScreen() {
  const router = useRouter();
  const userName = useSignupDraftStore((s) => s.account?.name ?? '');
  const updateVehicle = useSignupDraftStore((s) => s.updateVehicle);
  const vehicle = useSignupDraftStore((s) => s.vehicle);

  const [carNumber, setCarNumber] = useState('');
  const [carNumberError, setCarNumberError] = useState<string | undefined>();

  const trimmed = useMemo(() => carNumber.trim(), [carNumber]);
  const isNextEnabled = useMemo(() => trimmed.length > 0, [trimmed]);

  const validate = (value: string) => {
    const v = value.trim();
    if (!v) return '차량 번호를 입력해주세요.';
    return undefined;
  };

  const handleNext = () => {
    if (!isNextEnabled) return;

    updateVehicle({
      brandId: vehicle.brandId,
      brandName: vehicle.brandName,
      modelId: vehicle.modelId,
      modelName: vehicle.modelName,
      modelVariant: vehicle.modelVariant,
      modelStartYear: vehicle.modelStartYear,
      modelEndYear: vehicle.modelEndYear,
      registrationNumber: trimmed,
    });
    router.push('/(auth)/vehicle-mileage');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FormStepLayout
        onBack={() => router.back()}
        title={`${userName}님의\n차 번호를 입력해주세요`}
        subtitle="차량번호를 입력하면 차량 정보를 불러올 수 있어요"
        subtitleTone="body2"
        activeStepIndex={3}
        keyboardShouldPersistTaps="handled"
        footer={(
          <MainButton
            label="다음"
            disabled={!isNextEnabled}
            alwaysPrimary
            onPress={handleNext}
          />
        )}
      >
        <View style={{ alignItems: 'center' }}>
          <TextInput
            label="차량 번호"
            required
            value={carNumber}
            onChangeText={(v) => {
              setCarNumber(v);
              setCarNumberError(undefined);
            }}
            onBlur={() => setCarNumberError(validate(carNumber))}
            placeholder="예) 12가 3456"
            autoCapitalize="characters"
            maxLength={12}
            onClear={() => {
              setCarNumber('');
              setCarNumberError(undefined);
            }}
            error={carNumberError}
          />
        </View>
      </FormStepLayout>
    </KeyboardAvoidingView>
  );
}

