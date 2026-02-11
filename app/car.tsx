import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { borderRadius, colors, typography } from '@/theme';
import { NavigationBar } from '@/components/common/Bar/NavigationBar';
import { MainButton } from '@/components/common/Button/MainButton';
import { useAuthStore } from '@/stores/authStore';
import { useDrivingRecordStore } from '@/stores/drivingRecordStore';
import type { DrivingRecord } from '@/types/drivingRecord';

import ArrowLeftIcon from '../assets/icons/arrow-left.svg';
import SearchIcon from '../assets/icons/search.svg';
import GCarIcon from '../assets/icons/gcar.svg';
import XIcon from '../assets/icons/x_icon.svg';
import PointIcon from '../assets/icons/point.svg';

const TAG_MIN_WIDTH = 44;
const DATE_WHEEL_ITEM_HEIGHT = 44;
const DATE_WHEEL_HEIGHT = 220;
const DATE_WHEEL_PADDING = (DATE_WHEEL_HEIGHT - DATE_WHEEL_ITEM_HEIGHT) / 2;
const DATE_PICKER_YEARS: number[] = [2024, 2025, 2026, 2027, 2028];
const DATE_PICKER_MONTHS: number[] = Array.from({ length: 12 }, (_, i) => i + 1);

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function formatDateLabel(isoDateTime: string): string {
  const d = new Date(isoDateTime);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dayName = DAY_NAMES[d.getDay()];
  return `${y}. ${m}. ${day} (${dayName})`;
}

function formatTimeLabel(isoDateTime: string): string {
  const d = new Date(isoDateTime);
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

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
  const dateLabel = formatDateLabel(item.startDateTime);
  const earnedLabel = formatEarnedPointsLabel(item.earnedPoints);
  const startTime = formatTimeLabel(item.startDateTime);
  const endTime = formatTimeLabel(item.endDateTime);
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

  const yearListRef = useRef<FlatList<number> | null>(null);
  const monthListRef = useRef<FlatList<number> | null>(null);
  const yearIdxRef = useRef<number>(Math.max(0, DATE_PICKER_YEARS.indexOf(pickedYear)));
  const monthIdxRef = useRef<number>(Math.max(0, DATE_PICKER_MONTHS.indexOf(pickedMonth)));

  // 컴포넌트 마운트 시 현재 년월 기준으로 데이터 로드
  useEffect(() => {
    if (accessToken) {
      const defaultYearMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
      fetchRecords({ yearMonth: defaultYearMonth, accessToken });
      fetchSummary({ accessToken });
    }
  }, [accessToken]);

  // 총 운행거리 및 총 적립 포인트 (summary API 사용)
  const totalDistanceLabel = summary ? `${summary.totalDistanceKm.toFixed(1)} km` : '- km';
  const totalPointLabel = summary ? `${summary.totalEarnedPoints.toLocaleString()}` : '-';

  const openDatePicker = useCallback(() => setIsDatePickerOpen(true), []);
  const closeDatePicker = useCallback(() => setIsDatePickerOpen(false), []);


  const applyDatePicker = useCallback(() => {
    const newYearMonth = `${pickedYear}-${String(pickedMonth).padStart(2, '0')}`;
    closeDatePicker();
    if (accessToken) {
      fetchRecords({ yearMonth: newYearMonth, accessToken });
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
                  {yearMonth ? `${yearMonth.split('-')[0]}년 ${parseInt(yearMonth.split('-')[1], 10)}월` : `${currentYear}년 ${currentMonth}월`}
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
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary[50]} />
              </View>
            ) : error ? (
              <View style={{ paddingHorizontal: 20, paddingVertical: 40, alignItems: 'center' }}>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.body2Medium,
                    color: colors.coolNeutral[60],
                    textAlign: 'center',
                  }}
                >
                  {error}
                </Text>
              </View>
            ) : records.length === 0 ? (
              <View style={{ paddingHorizontal: 20, paddingVertical: 40, alignItems: 'center', gap: 13 }}>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.body2Medium,
                    color: colors.coolNeutral[60],
                    textAlign: 'center',
                  }}
                >
                  {yearMonth
                    ? `${parseInt(yearMonth.split('-')[1], 10)}월은 아직\n운행기록이 없어요`
                    : '아직 운행 기록이 없습니다.'}
                </Text>
                {yearMonth && (
                  <Pressable
                    onPress={() => {
                      // 날짜 선택 모달의 기본값도 현재 날짜로 초기화
                      const today = new Date();
                      setPickedYear(today.getFullYear());
                      setPickedMonth(today.getMonth() + 1);
                      const defaultYM = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
                      if (accessToken) {
                        fetchRecords({ yearMonth: defaultYM, accessToken });
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

      {/* 날짜 선택 모달 */}
      <Modal
        visible={isDatePickerOpen}
        transparent
        animationType="fade"
        onRequestClose={closeDatePicker}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.32)', justifyContent: 'flex-end' }}>
          <Pressable
            onPress={closeDatePicker}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
            accessibilityRole="button"
            accessibilityLabel="dismiss-date-picker"
          />

          <View
            style={{
              width: '100%',
              backgroundColor: colors.background.default,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 18,
              paddingBottom: 24,
              paddingHorizontal: 20,
              gap: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body1Semibold,
                  color: colors.coolNeutral[80],
                }}
              >
                날짜 선택
              </Text>
              <Pressable
                onPress={closeDatePicker}
                accessibilityRole="button"
                accessibilityLabel="close-date-picker"
                style={{ alignItems: 'center', justifyContent: 'center' }}
              >
                <XIcon width={24} height={24} />
              </Pressable>
            </View>

            <View style={{ gap: 24 }}>
              <View
                style={{
                  width: '100%',
                  borderRadius: borderRadius.lg,
                  backgroundColor: colors.coolNeutral[10],
                  borderWidth: 1,
                  borderColor: colors.coolNeutral[20],
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                }}
              >
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {/* Year */}
                  <View style={{ flex: 1, position: 'relative' }}>
                    {/* 중앙 선택 영역 고정 하이라이트 */}
                    <View
                      pointerEvents="none"
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: DATE_WHEEL_PADDING,
                        height: DATE_WHEEL_ITEM_HEIGHT,
                        borderRadius: borderRadius.md,
                        backgroundColor: colors.background.default,
                      }}
                    />
                    <FlatList
                      ref={(r) => {
                        yearListRef.current = r;
                      }}
                      data={DATE_PICKER_YEARS}
                      keyExtractor={(item) => `y-${item}`}
                      showsVerticalScrollIndicator={false}
                      initialScrollIndex={Math.max(0, DATE_PICKER_YEARS.indexOf(pickedYear))}
                      initialNumToRender={DATE_PICKER_YEARS.length}
                      snapToInterval={DATE_WHEEL_ITEM_HEIGHT}
                      decelerationRate="fast"
                      contentContainerStyle={{ paddingVertical: DATE_WHEEL_PADDING }}
                      getItemLayout={(_, index) => ({
                        length: DATE_WHEEL_ITEM_HEIGHT,
                        offset: DATE_WHEEL_ITEM_HEIGHT * index,
                        index,
                      })}
                      style={{ height: DATE_WHEEL_HEIGHT }}
                      onScrollToIndexFailed={() => {}}
                      scrollEventThrottle={16}
                      onScroll={(e) => {
                        const idx = Math.round(e.nativeEvent.contentOffset.y / DATE_WHEEL_ITEM_HEIGHT);
                        if (idx === yearIdxRef.current) return;
                        const y = DATE_PICKER_YEARS[idx];
                        if (!y) return;
                        yearIdxRef.current = idx;
                        setPickedYear(y);
                      }}
                      renderItem={({ item, index }) => {
                        const selected = item === pickedYear;
                        return (
                          <Pressable
                            onPress={() => {
                              setPickedYear(item);
                              yearListRef.current?.scrollToIndex({ index, animated: true });
                            }}
                            style={{
                              height: DATE_WHEEL_ITEM_HEIGHT,
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: borderRadius.md,
                              backgroundColor: 'transparent',
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: typography.fontFamily.pretendard,
                                ...typography.styles.body2Bold,
                                color: selected ? colors.primary[50] : colors.coolNeutral[40],
                              }}
                            >
                              {item}년
                            </Text>
                          </Pressable>
                        );
                      }}
                    />
                  </View>

                  {/* Month */}
                  <View style={{ flex: 1, position: 'relative' }}>
                    {/* 중앙 선택 영역 고정 하이라이트 */}
                    <View
                      pointerEvents="none"
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: DATE_WHEEL_PADDING,
                        height: DATE_WHEEL_ITEM_HEIGHT,
                        borderRadius: borderRadius.md,
                        backgroundColor: colors.background.default,
                      }}
                    />
                    <FlatList
                      ref={(r) => {
                        monthListRef.current = r;
                      }}
                      data={DATE_PICKER_MONTHS}
                      keyExtractor={(item) => `m-${item}`}
                      showsVerticalScrollIndicator={false}
                      initialScrollIndex={Math.max(0, DATE_PICKER_MONTHS.indexOf(pickedMonth))}
                      initialNumToRender={DATE_PICKER_MONTHS.length}
                      snapToInterval={DATE_WHEEL_ITEM_HEIGHT}
                      decelerationRate="fast"
                      contentContainerStyle={{ paddingVertical: DATE_WHEEL_PADDING }}
                      getItemLayout={(_, index) => ({
                        length: DATE_WHEEL_ITEM_HEIGHT,
                        offset: DATE_WHEEL_ITEM_HEIGHT * index,
                        index,
                      })}
                      style={{ height: DATE_WHEEL_HEIGHT }}
                      onScrollToIndexFailed={() => {}}
                      scrollEventThrottle={16}
                      onScroll={(e) => {
                        const idx = Math.round(e.nativeEvent.contentOffset.y / DATE_WHEEL_ITEM_HEIGHT);
                        if (idx === monthIdxRef.current) return;
                        const m = DATE_PICKER_MONTHS[idx];
                        if (!m) return;
                        monthIdxRef.current = idx;
                        setPickedMonth(m);
                      }}
                      renderItem={({ item, index }) => {
                        const selected = item === pickedMonth;
                        return (
                          <Pressable
                            onPress={() => {
                              setPickedMonth(item);
                              monthListRef.current?.scrollToIndex({ index, animated: true });
                            }}
                            style={{
                              height: DATE_WHEEL_ITEM_HEIGHT,
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: borderRadius.md,
                              backgroundColor: 'transparent',
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: typography.fontFamily.pretendard,
                                ...typography.styles.body2Bold,
                                color: selected ? colors.primary[50] : colors.coolNeutral[40],
                              }}
                            >
                              {item}월
                            </Text>
                          </Pressable>
                        );
                      }}
                    />
                  </View>
                </View>
              </View>

              <MainButton
                label={`${pickedYear}년 ${pickedMonth}월 선택`}
                alwaysPrimary
                onPress={applyDatePicker}
                containerStyle={{ width: '100%' }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ width: '100%', backgroundColor: colors.coolNeutral[10] }}>
        <NavigationBar
          active="car"
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
    </SafeAreaView>
  );
}

