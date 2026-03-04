import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { borderRadius, colors, typography } from '@/theme';
import { NavigationBar } from '@/components/common/Bar/NavigationBar';
import { CarDatePickerModal } from '@/components/car/modals/CarDatePickerModal';
import { ContentState } from '@/components/common/State/ContentState';
import { useAuthStore } from '@/stores/authStore';
import { useDrivingRecordStore } from '@/stores/drivingRecordStore';
import type { DrivingRecord } from '@/types/drivingRecord';
import {
  formatDateWithDay,
  formatMonthKoreanFromYm,
  formatTimeHHMM,
  formatYearMonthKorean,
  formatYearMonthKoreanFromYm,
  toYearMonth,
} from '@/utils/date';
import { getTabRoute } from '@/utils/navigation';

import ArrowLeftIcon from '@/assets/icons/arrow-left.svg';
import SearchIcon from '@/assets/icons/search.svg';
import GCarIcon from '@/assets/icons/gcar.svg';
import PointIcon from '@/assets/icons/point.svg';

const TAG_MIN_WIDTH = 44;

function formatDistanceLabel(distanceKm: number): string {
  return `${distanceKm.toFixed(1)} km`;
}

function formatEarnedPointsLabel(points: number): string {
  return `+ ${points.toLocaleString()}`;
}

function formatCarModel(brandName: string, modelName: string, variantName: string): string {
  const parts = [brandName, modelName, variantName].filter(Boolean);
  return parts.join(' ');
}

function CoinCMark({ size = 14 }: { size?: number }) {
  return <PointIcon width={size} height={size} />;
}

function StatCell({ label, value, valueNode }: { label: string; value?: string; valueNode?: React.ReactNode }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 8 }}>
      <Text
        style={{
          fontFamily: typography.fontFamily.pretendard,
          ...typography.styles.body2Medium,
          color: colors.primary[50],
        }}
      >
        {label}
      </Text>
      {valueNode ?? (
        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.h2Semibold,
            color: colors.primary[50],
          }}
        >
          {value}
        </Text>
      )}
    </View>
  );
}

function Tag({ label }: { label: '출발' | '도착' }) {
  return (
    <View
      style={{
        height: 24,
        minWidth: TAG_MIN_WIDTH,
        paddingHorizontal: 8,
        borderRadius: 999,
        backgroundColor: colors.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontFamily: typography.fontFamily.pretendard,
          ...typography.styles.body2Semibold,
          color: colors.coolNeutral[10],
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function DriveRecordCard({ item, onPress }: { item: DrivingRecord; onPress?: () => void }) {
  const dateLabel = formatDateWithDay(item.startDateTime);
  const earnedLabel = formatEarnedPointsLabel(item.earnedPoints);
  const startTime = formatTimeHHMM(item.startDateTime);
  const endTime = formatTimeHHMM(item.endDateTime);
  const distanceLabel = formatDistanceLabel(item.distanceKm);
  const carModel = formatCarModel(item.vehicleBrandName, item.vehicleModelName, item.vehicleVariantName);

  return (
    <Pressable
      onPress={onPress}
      style={{
        width: '100%',
        backgroundColor: colors.coolNeutral[10],
        borderRadius: borderRadius.lg,
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 8,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.body1Semibold,
            color: colors.coolNeutral[80],
          }}
        >
          {dateLabel}
        </Text>
        {item.earnedPoints > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.h3Semibold,
                color: colors.primary[50],
              }}
            >
              {earnedLabel}
            </Text>
            <CoinCMark size={14} />
          </View>
        )}
      </View>

      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
          <Tag label="출발" />
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body2Medium,
                color: colors.coolNeutral[60],
              }}
            >
              {startTime}
            </Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                flex: 1,
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body2Medium,
                color: colors.coolNeutral[40],
              }}
            >
              {item.startLocation}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
          <Tag label="도착" />
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body2Medium,
                color: colors.coolNeutral[60],
              }}
            >
              {endTime}
            </Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                flex: 1,
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body2Medium,
                color: colors.coolNeutral[40],
              }}
            >
              {item.endLocation}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
        {/* 출발/도착 태그 자리만큼 앞 공간 */}
        <View style={{ width: TAG_MIN_WIDTH, height: 24 }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text
            style={{
              fontFamily: typography.fontFamily.pretendard,
              ...typography.styles.body3Semibold,
              color: colors.coolNeutral[40],
            }}
          >
            {distanceLabel}
          </Text>
          <Text
            style={{
              fontFamily: typography.fontFamily.pretendard,
              ...typography.styles.body3Semibold,
              color: colors.coolNeutral[40],
            }}
          >
            |
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <GCarIcon width={16} height={16} />
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body3Semibold,
                color: colors.coolNeutral[40],
              }}
            >
              {carModel}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function CarScreen() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const {
    records,
    yearMonth,
    monthlyCount,
    isLoading,
    error,
    fetchRecords,
    summary,
    fetchSummary,
  } = useDrivingRecordStore();

  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);

  // 현재 날짜 기준 초기값
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const [pickedYear, setPickedYear] = useState<number>(currentYear);
  const [pickedMonth, setPickedMonth] = useState<number>(currentMonth);

  // 컴포넌트 마운트 시 현재 년월 기준으로 데이터 로드
  useEffect(() => {
    if (accessToken) {
      const defaultYearMonth = toYearMonth(currentYear, currentMonth);
      fetchRecords({ yearMonth: defaultYearMonth });
      fetchSummary();
    }
  }, [accessToken]);

  // 총 운행거리 및 총 적립 포인트 (summary API 사용)
  const totalDistanceLabel = summary ? `${summary.totalDistanceKm.toFixed(1)} km` : '- km';
  const totalPointLabel = summary ? `${summary.totalEarnedPoints.toLocaleString()}` : '-';

  const openDatePicker = useCallback(() => setIsDatePickerOpen(true), []);
  const closeDatePicker = useCallback(() => setIsDatePickerOpen(false), []);


  const applyDatePicker = useCallback(() => {
    const newYearMonth = toYearMonth(pickedYear, pickedMonth);
    closeDatePicker();
    if (accessToken) {
      fetchRecords({ yearMonth: newYearMonth });
    }
  }, [pickedYear, pickedMonth, accessToken, fetchRecords, closeDatePicker]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.coolNeutral[10] }}>
      <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ alignItems: 'stretch' }}>
        <View
          style={{
            width: '100%',
            backgroundColor: colors.coolNeutral[10],
            gap: 18,
          }}
        >
          <View style={{ width: '100%', gap: 20 }}>
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
                  color: colors.coolNeutral[80],
                }}
              >
                운행기록
              </Text>
            </View>

            <View style={{ gap: 24 }}>
              {/* 요약 카드 */}
              <View style={{ paddingHorizontal: 20 }}>
                <View
                  style={{
                    width: '100%',
                    borderRadius: borderRadius.lg,
                    backgroundColor: colors.primary[20],
                    padding: 20,
                  }}
                >
                  {/* 텍스트(2개) + 구분선만 묶는 컨텐츠 View */}
                  <View
                    style={{
                      width: '100%',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 26,
                    }}
                  >
                    <StatCell label="총 운행거리" value={totalDistanceLabel} />
                    <View style={{ width: 1, height: 56, backgroundColor: colors.primary[50] }} />
                    <StatCell
                      label="총 운행 적립 포인트"
                      valueNode={
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Text
                            style={{
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.h2Semibold,
                              color: colors.primary[50],
                            }}
                          >
                            {totalPointLabel}
                          </Text>
                          <PointIcon width={20} height={20} />
                        </View>
                      }
                    />
                  </View>
                </View>
              </View>

              {/* 날짜 검색 */}
              <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
                <Pressable
                  onPress={openDatePicker}
                  accessibilityRole="button"
                  accessibilityLabel="open-date-picker"
                  style={{
                    width: '100%',
                    height: 44,
                    borderRadius: borderRadius.md,
                    backgroundColor: colors.background.default,
                    paddingHorizontal: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.body1Semibold,
                      color: colors.coolNeutral[60],
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    날짜 검색
                  </Text>
                  <SearchIcon width={20} height={20} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* 리스트 영역 */}
        <View style={{ width: '100%', backgroundColor: colors.background.default, paddingTop: 12, paddingBottom: 20, minHeight: 200 }}>
          <View style={{ width: '100%', gap: 12 }}>
            <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    fontSize: 20,
                    fontWeight: '700',
                    fontStyle: 'normal',
                    color: colors.coolNeutral[90],
                  }}
                >
                  {yearMonth
                    ? formatYearMonthKoreanFromYm(yearMonth)
                    : formatYearMonthKorean(currentYear, currentMonth)}
                </Text>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    fontSize: 20,
                    fontWeight: '700',
                    fontStyle: 'normal',
                    color: colors.primary[50],
                  }}
                >
                  {monthlyCount}건
                </Text>
              </View>
            </View>

            {isLoading ? (
              <ContentState variant="loading" />
            ) : error ? (
              <ContentState variant="error" message={error} />
            ) : records.length === 0 ? (
              <View style={{ paddingHorizontal: 20, paddingVertical: 40, alignItems: 'center', gap: 13 }}>
                <ContentState
                  variant="empty"
                  message={
                    yearMonth
                      ? `${formatMonthKoreanFromYm(yearMonth)}은 아직\n운행기록이 없어요`
                      : '아직 운행 기록이 없습니다.'
                  }
                  containerStyle={{ paddingHorizontal: 0, paddingVertical: 0, gap: 0 }}
                />
                {yearMonth && (
                  <Pressable
                    onPress={() => {
                      // 날짜 선택 모달의 기본값도 현재 날짜로 초기화
                      const today = new Date();
                      setPickedYear(today.getFullYear());
                      setPickedMonth(today.getMonth() + 1);
                      const defaultYM = toYearMonth(today.getFullYear(), today.getMonth() + 1);
                      if (accessToken) {
                        fetchRecords({ yearMonth: defaultYM });
                      }
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="view-all-records"
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.primary[50],
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body2Semibold,
                        color: colors.coolNeutral[10],
                      }}
                    >
                      최신순으로 보기
                    </Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <View style={{ gap: 12, paddingHorizontal: 20 }}>
                {records.map((item) => (
                  <DriveRecordCard
                    key={item.id}
                    item={item}
                    onPress={() => {
                      router.push({
                        pathname: '/car-detail',
                        params: {
                          drivingRecordId: String(item.id),
                        },
                      });
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <CarDatePickerModal
        visible={isDatePickerOpen}
        pickedYear={pickedYear}
        pickedMonth={pickedMonth}
        onClose={closeDatePicker}
        onSetPickedYear={setPickedYear}
        onSetPickedMonth={setPickedMonth}
        onConfirm={applyDatePicker}
      />

      <View style={{ width: '100%', backgroundColor: colors.coolNeutral[10] }}>
        <NavigationBar
          active="car"
          showBorder
          onPress={(tab) => router.push(getTabRoute(tab))}
        />
      </View>
    </SafeAreaView>
  );
}

