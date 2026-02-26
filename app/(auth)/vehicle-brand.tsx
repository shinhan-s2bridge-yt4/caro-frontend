import { useEffect, useMemo, useState } from 'react';
import {
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { colors, typography } from '@/theme';
import type { VehicleBrand } from '@/types/vehicle';
import { getVehicleBrands } from '@/services/vehicleService';
import { CarButton } from '@/components/common/Button/CarButton';
import { MainButton } from '@/components/common/Button/MainButton';
import FormStepLayout from '@/components/common/Layout/FormStepLayout';
import { useSignupDraftStore } from '@/stores/signupDraftStore';

export default function VehicleBrandScreen() {
  const router = useRouter();
  const updateVehicle = useSignupDraftStore((s) => s.updateVehicle);

  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    getVehicleBrands()
      .then((data) => {
        if (!mounted) return;
        setBrands(data);
      })
      .catch((e: unknown) => {
        if (!mounted) return;
        const message =
          e instanceof Error ? e.message : '차량 제조사 목록을 불러오지 못했어요.';
        setErrorMessage(message);
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const isNextEnabled = useMemo(() => selectedBrandId !== null, [selectedBrandId]);

  const handleNext = () => {
    if (!isNextEnabled) return;
    const selected = brands.find((b) => b.id === selectedBrandId) ?? null;
    if (!selected) return;

    updateVehicle({
      brandId: selected.id,
      brandName: selected.name,
    });
    router.push('/(auth)/vehicle-model');
  };

  return (
    <FormStepLayout
      onBack={() => router.back()}
      title="어떤 제조사의 차량인가요?"
      subtitle="내 차 브랜드를 선택해주세요"
      activeStepIndex={1}
      bodyMarginTop={26}
      bodyContainerStyle={{ paddingHorizontal: 20 }}
      footer={(
        <MainButton
          label="다음"
          disabled={!isNextEnabled}
          alwaysPrimary
          onPress={handleNext}
        />
      )}
    >
      {/* 목록 */}
      <View>
            {isLoading ? (
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body3Regular,
                  color: colors.coolNeutral[40],
                }}
              >
                불러오는 중...
              </Text>
            ) : errorMessage ? (
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body3Regular,
                  color: colors.error ?? colors.red[50],
                }}
              >
                {errorMessage}
              </Text>
            ) : (
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {/* 2열 배치 */}
                <View style={{ flex: 1, gap: 12, alignItems: 'center' }}>
                  {brands
                    .filter((_, i) => i % 2 === 0)
                    .map((brand) => (
                      <CarButton
                        key={brand.id}
                        label={brand.name}
                        isSelected={selectedBrandId === brand.id}
                        onPress={() => setSelectedBrandId(brand.id)}
                      />
                    ))}
                </View>
                <View style={{ flex: 1, gap: 12, alignItems: 'center' }}>
                  {brands
                    .filter((_, i) => i % 2 === 1)
                    .map((brand) => (
                      <CarButton
                        key={brand.id}
                        label={brand.name}
                        isSelected={selectedBrandId === brand.id}
                        onPress={() => setSelectedBrandId(brand.id)}
                      />
                    ))}
                </View>
              </View>
            )}
      </View>
    </FormStepLayout>
  );
}

