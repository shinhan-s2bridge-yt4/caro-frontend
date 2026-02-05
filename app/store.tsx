import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, typography } from '@/theme';
import { NavigationBar } from '@/components/common/Bar/NavigationBar';
import CouponTab from '@/components/common/Category/CouponTab';

import ArrowLeftIcon from '../assets/icons/arrow-left.svg';
import DownIcon from '../assets/icons/DownIcon.svg';

const SCREEN_MAX_WIDTH = 375;

type PointHistoryItem = {
  id: string;
  title: string;
  amount: number; // + 적립, - 사용
  date: string; // YYYY-MM-DD
  meta?: {
    durationLabel?: string; // e.g. "38분 운행"
    distanceLabel?: string; // e.g. "15.3 km"
  };
};

function formatPointAmount(amount: number) {
  const abs = Math.abs(amount).toLocaleString('ko-KR');
  return `${amount >= 0 ? '+ ' : '- '}${abs} P`;
}

function formatPointTotal(amount: number) {
  return `${amount.toLocaleString('ko-KR')} P`;
}

function PointHistoryCard({ item }: { item: PointHistoryItem }) {
  const isEarn = item.amount >= 0;
  const amountColor = isEarn ? colors.primary[50] : colors.red[50];

  return (
    <View
      style={{
        width: '100%',
        borderRadius: borderRadius.lg,
        backgroundColor: colors.coolNeutral[20],
        paddingHorizontal: 20,
        paddingVertical: 18,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.body1Bold,
            color: colors.coolNeutral[90],
          }}
        >
          {item.title}
        </Text>
        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.body1Bold,
            color: amountColor,
          }}
        >
          {formatPointAmount(item.amount)}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="calendar-outline" size={14} color={colors.coolNeutral[40]} />
          <Text
            style={{
              fontFamily: typography.fontFamily.pretendard,
              ...typography.styles.body3Regular,
              color: colors.coolNeutral[40],
            }}
          >
            {item.date}
          </Text>
        </View>

        {item.meta?.durationLabel ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="time-outline" size={14} color={colors.coolNeutral[40]} />
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body3Regular,
                color: colors.coolNeutral[40],
              }}
            >
              {item.meta.durationLabel}
            </Text>
          </View>
        ) : null}

        {item.meta?.distanceLabel ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="car-outline" size={14} color={colors.coolNeutral[40]} />
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body3Regular,
                color: colors.coolNeutral[40],
              }}
            >
              {item.meta.distanceLabel}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function StoreScreen() {
  const router = useRouter();
  const rewardTabs = useMemo(
    () => [
      { id: 'point', label: '포인트' },
      { id: 'store', label: '스토어' },
      { id: 'coupon', label: '보유쿠폰' },
    ],
    [],
  );
  const [selectedTab, setSelectedTab] = useState<string>(rewardTabs[0]?.id ?? 'point');

  const pointTotal = 32450;

  const history = useMemo<PointHistoryItem[]>(
    () => [
      {
        id: 'h1',
        title: '운행적립',
        amount: 153,
        date: '2026-02-01',
        meta: { durationLabel: '38분 운행', distanceLabel: '15.3 km' },
      },
      {
        id: 'h2',
        title: '운행적립',
        amount: 153,
        date: '2026-02-01',
        meta: { durationLabel: '38분 운행', distanceLabel: '15.3 km' },
      },
      {
        id: 'h3',
        title: '스타벅스 3천원 모바일 교환권',
        amount: -1500,
        date: '2026-02-01',
      },
      {
        id: 'h4',
        title: '주유소 쿠폰 교환',
        amount: -1500,
        date: '2026-02-01',
      },
      {
        id: 'h5',
        title: '운행적립',
        amount: 153,
        date: '2026-02-01',
        meta: { durationLabel: '38분 운행', distanceLabel: '15.3 km' },
      },
    ],
    [],
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.coolNeutral[10] }}>
      <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ alignItems: 'stretch', paddingBottom: 16 }}>
        <View style={{ width: '100%', maxWidth: SCREEN_MAX_WIDTH, alignSelf: 'center' }}>
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
                ...typography.styles.body1Semibold,
                color: colors.coolNeutral[90],
              }}
            >
              리워드
            </Text>
          </View>

          {/* 탭 */}
          <CouponTab tabs={rewardTabs} selectedTab={selectedTab} onTabChange={setSelectedTab} />

          {selectedTab === 'point' ? (
            <View style={{ paddingHorizontal: 20, paddingTop: 18, gap: 18 }}>
              {/* 포인트 카드 */}
              <View
                style={{
                  width: '100%',
                  borderRadius: borderRadius.lg,
                  backgroundColor: colors.primary[50],
                  paddingHorizontal: 22,
                  paddingVertical: 20,
                  gap: 10,
                }}
              >
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.body2Semibold,
                    color: colors.coolNeutral[10],
                    opacity: 0.95,
                  }}
                >
                  나의 포인트
                </Text>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.h1Bold,
                    color: colors.coolNeutral[10],
                    letterSpacing: typography.letterSpacing.tightest,
                  }}
                >
                  {formatPointTotal(pointTotal)}
                </Text>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.body3Regular,
                    color: 'rgba(255,255,255,0.85)',
                  }}
                >
                  1km 당 1포인트 자동적립
                </Text>
              </View>

              {/* 리스트 헤더 */}
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.h3Bold,
                    color: colors.coolNeutral[90],
                  }}
                >
                  전체
                </Text>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.h3Bold,
                    color: colors.primary[50],
                  }}
                >
                  {history.length}건
                </Text>
              </View>

              {/* 히스토리 카드들 */}
              <View style={{ gap: 12 }}>
                {history.map((item) => (
                  <PointHistoryCard key={item.id} item={item} />
                ))}
              </View>

              {/* 더보기 */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="more"
                style={{ paddingVertical: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
                onPress={() => {
                  // TODO: API 연결 시 페이징/추가 로딩
                }}
              >
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.body3Regular,
                    color: colors.coolNeutral[50],
                  }}
                >
                  더보기
                </Text>
                <DownIcon width={16} height={16} />
              </Pressable>
            </View>
          ) : (
            <View style={{ paddingHorizontal: 20, paddingTop: 28 }}>
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body2Medium,
                  color: colors.coolNeutral[50],
                  textAlign: 'center',
                }}
              >
                준비 중인 탭이에요. API 연결 후 콘텐츠가 표시됩니다.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <NavigationBar
        active="store"
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
    </SafeAreaView>
  );
}

