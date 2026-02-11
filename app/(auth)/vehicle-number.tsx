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

import { colors, typography } from '@/theme';
import ProgressBar from '@/components/common/Bar/ProgressBar';
import TextInput from '@/components/common/Input/TextInput';
import { MainButton } from '@/components/common/Button/MainButton';
import { useSignupDraftStore } from '@/stores/signupDraftStore';

import ArrowLeftIcon from '@/assets/icons/arrow-left.svg';

const SCREEN_MAX_WIDTH = 375;

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
              <ProgressBar total={5} activeIndex={3} />
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
              {userName}님의{'\n'}차 번호를 입력해주세요
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body2Regular,
                  color: colors.coolNeutral[40],
                }}
              >
                차량번호를 입력하면 차량 정보를 불러올 수 있어요
              </Text>
            </View>

            {/* 입력 */}
            <View style={{ marginTop: 46, alignItems: 'center' }}>
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

            {/* 하단 버튼 */}
            <View style={{ flex: 1 }} />
            <View style={{ alignItems: 'center', marginBottom: 20, marginTop: 48 }}>
              <MainButton
                label="다음"
                disabled={!isNextEnabled}
                alwaysPrimary
                onPress={handleNext}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

