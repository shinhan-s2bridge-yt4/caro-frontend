import { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { colors, typography, borderRadius } from '@/theme';
import ProgressBar from '@/components/common/Bar/ProgressBar';
import CarTypeInput from '@/components/common/Input/CarTypeInput';
import { MainButton } from '@/components/common/Button/MainButton';
import { getVehicleModels } from '@/services/vehicleService';
import type { VehicleModel } from '@/types/vehicle';
import { useSignupDraftStore } from '@/stores/signupDraftStore';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';

const SCREEN_MAX_WIDTH = 375;

function formatYears(startYear: number, endYear: number) {
  if (!startYear && !endYear) return '';
  if (startYear && !endYear) return `${startYear}년 - 현재`;
  if (!startYear && endYear) return `- ${endYear}년`;
  if (startYear === endYear) return `${startYear}년`;
  return `${startYear}년 - ${endYear}년`;
}

export default function VehicleModelScreen() {
  const router = useRouter();
  const updateVehicle = useSignupDraftStore((s) => s.updateVehicle);
  const brandId = useSignupDraftStore((s) => s.vehicle.brandId ?? null);
  const brandName = useSignupDraftStore((s) => s.vehicle.brandName ?? '');

  const [keyword, setKeyword] = useState('');
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [inputError, setInputError] = useState<string | undefined>();
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const isNextEnabled = useMemo(() => selectedModelId !== null, [selectedModelId]);

  const handleSearch = async () => {
    setInputError(undefined);
    setResultMessage(null);

    if (!Number.isFinite(brandId) || (brandId ?? 0) <= 0) {
      setInputError('제조사 정보가 올바르지 않아요. 이전 화면에서 다시 선택해주세요.');
      return;
    }
    if (!keyword.trim()) {
      setInputError('차종을 입력해주세요.');
      return;
    }

    try {
      setIsSearching(true);
      setSelectedModelId(null);
      const data = await getVehicleModels({
        brandId: brandId as number,
        keyword: keyword.trim(),
      });
      setModels(data);
      if (data.length === 0) {
        setResultMessage('일치하는 차량이 없어요.\n다른 차량명을 입력해 주세요.');
      }
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : '차종 목록을 불러오지 못했어요.';
      setResultMessage(message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleNext = () => {
    if (!isNextEnabled) return;
    const selected = models.find((m) => m.id === selectedModelId) ?? null;
    if (!selected) return;

    updateVehicle({
      brandId: brandId as number,
      brandName,
      modelId: selected.id,
      modelName: selected.name,
      modelVariant: selected.variant,
      modelStartYear: selected.startYear,
      modelEndYear: selected.endYear,
    });
    router.push('/(auth)/vehicle-number');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.coolNeutral[10] }}>
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
            <ProgressBar total={5} activeIndex={2} />
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
              어떤 차량인가요?
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body3Regular,
                color: colors.coolNeutral[40],
              }}
            >
              소유하고 계신 차량의 이름을 검색해주세요.
            </Text>
          </View>

          {/* 검색 */}
          <View style={{ marginTop: 46, alignItems: 'center' }}>
            <CarTypeInput
              label="차종검색"
              required
              value={keyword}
              onChangeText={(v) => {
                setKeyword(v);
                setInputError(undefined);
                setResultMessage(null);
              }}
              placeholder="차종을 검색해주세요"
              onClear={() => {
                setKeyword('');
                setInputError(undefined);
                setResultMessage(null);
                setModels([]);
                setSelectedModelId(null);
              }}
              onCheckDuplicate={handleSearch}
              error={inputError}
            />
          </View>

          {/* 결과 */}
          {brandName ? (
            <View style={{ marginTop: 24, paddingHorizontal: 20 }}>
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body3Semibold,
                  color: colors.coolNeutral[80],
                }}
              >
                {brandName} 차량
              </Text>
            </View>
          ) : null}

          <View style={{ marginTop: 12, paddingHorizontal: 20, gap: 8 }}>
            {isSearching ? (
              <Text
                style={{
                  textAlign: 'center',
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body2Semibold,
                  color: colors.coolNeutral[40],
                }}
              >
                검색 중...
              </Text>
            ) : models.length === 0 && resultMessage ? (
              <View style={{ marginTop: 102, alignItems: 'center' }}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.body2Semibold,
                    color: colors.coolNeutral[40],
                  }}
                >
                  {resultMessage}
                </Text>
              </View>
            ) : (
              models.map((m) => {
                const isSelected = selectedModelId === m.id;
                const years = formatYears(m.startYear, m.endYear);
                const title = m.variant ? `${m.name} ${m.variant}` : m.name;

                return (
                  <Pressable
                    key={m.id}
                    onPress={() => setSelectedModelId(m.id)}
                    style={{
                      width: '100%',
                      borderRadius: borderRadius.lg,
                      paddingVertical: 16,
                      paddingHorizontal: 20,
                      borderWidth: 1,
                      borderColor: isSelected
                        ? colors.primary[50]
                        : colors.coolNeutral[10],
                      backgroundColor: isSelected
                        ? colors.coolNeutral[10]
                        : colors.background.default,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body2Semibold,
                        color: isSelected
                          ? colors.primary[50]
                          : colors.coolNeutral[80],
                      }}
                    >
                      {title}
                    </Text>
                    {!!years && (
                      <Text
                        style={{
                          marginTop: 3,
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body3Medium,
                          color: colors.coolNeutral[40],
                        }}
                      >
                        {years}
                      </Text>
                    )}
                  </Pressable>
                );
              })
            )}
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
    </SafeAreaView>
  );
}

