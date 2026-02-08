import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { colors, typography } from '@/theme';
import type { VehicleBrand } from '@/types/vehicle';
import { getVehicleBrands } from '@/services/vehicleService';
import ProgressBar from '@/components/common/Bar/ProgressBar';
import { CarButton } from '@/components/common/Button/CarButton';
import { MainButton } from '@/components/common/Button/MainButton';
import { useSignupDraftStore } from '@/stores/signupDraftStore';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';

const SCREEN_MAX_WIDTH = 375;

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.coolNeutral[10] }}>
      <ScrollView
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
            <ProgressBar total={5} activeIndex={1} />
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
              어떤 제조사의 차량인가요?
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body3Regular,
                color: colors.coolNeutral[40],
              }}
            >
              내 차 브랜드를 선택해주세요
            </Text>
          </View>

          {/* 목록 */}
          <View style={{ marginTop: 26, paddingHorizontal: 20 }}>
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

          {/* 하단 버튼 */}
          <View style={{ flex: 1 }} />
          <View style={{ alignItems: 'center', marginTop: 49, marginBottom: 20 }}>
            <MainButton
              label="다음"
              disabled={!isNextEnabled}
              alwaysPrimary
              onPress={handleNext}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

