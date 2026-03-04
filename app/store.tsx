import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 네이티브 전용 바코드 컴포넌트 - 웹에서는 텍스트 대체
let Barcode: any = null;
if (Platform.OS !== 'web') {
  Barcode = require('react-native-barcode-svg').default;
}
import { useRouter, useLocalSearchParams } from 'expo-router';

import { borderRadius, colors, typography } from '@/theme';
import { NavigationBar } from '@/components/common/Bar/NavigationBar';
import CouponTab from '@/components/common/Category/CouponTab';
import { StoreMyPointCard } from '@/components/store/cards/StoreMyPointCard';
import { OverlayModal } from '@/components/common/Modal/OverlayModal';
import { StoreCouponUseModal } from '@/components/store/modals/StoreCouponUseModal';
import {
  StoreCouponSection,
  StorePointHistorySection,
  StoreProductsSection,
} from '@/components/store/sections/StoreTabSections';
import { useStoreScreenData } from '@/hooks/store/useStoreScreenData';
import { useAuthStore } from '@/stores/authStore';
import {
  type RewardCoupon,
  type PointHistory,
  type MemberCoupon,
  type MemberCouponDetail,
} from '@/services/rewardService';
import {
  formatDateOnly,
} from '@/utils/date';
import { getTabRoute } from '@/utils/navigation';
import { formatPointDelta, formatPointNumber, formatPointTotal } from '@/utils/points';
import { toRewardImageUrl } from '@/utils/rewardImage';

import ArrowLeftIcon from '@/assets/icons/arrow-left.svg';
import WDownIcon from '@/assets/icons/wdown.svg';
import PointIcon from '@/assets/icons/point.svg';
import Coffee1Icon from '@/assets/icons/coffee1.svg';
import CalendarIcon from '@/assets/icons/calendar.svg';

import GcarIcon from '@/assets/icons/gcar.svg';
import RcarIcon from '@/assets/icons/rcar.svg';
import RcalIcon from '@/assets/icons/rcal.svg';
import RcouponIcon from '@/assets/icons/rcoupon.svg';

const SCREEN_MAX_WIDTH = 375;

type StoreCategoryKey = string;

// 상품 카드 컴포넌트 (API 응답 기반)
function ProductCard({ product, onPress }: { product: RewardCoupon; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        borderRadius: borderRadius.lg,
        paddingVertical: 10,
        gap: 8,
      }}
    >
      {/* 상품 이미지 */}
      <View
        style={{
          width: '100%',
          aspectRatio: 1,
          backgroundColor: colors.coolNeutral[20],
          borderRadius: borderRadius.md,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {product.imageUrl ? (
          <Image
            source={{ uri: toRewardImageUrl(product.imageUrl) }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <Coffee1Icon width="60%" height="60%" />
        )}
      </View>

      {/* 브랜드명 */}
      <Text
        style={{
          fontFamily: typography.fontFamily.pretendard,
          ...typography.styles.body3Semibold,
          color: colors.coolNeutral[60],
        }}
      >
        {product.brandName}
      </Text>

      {/* 상품명 + 가격 */}
      <View style={{ gap: 4 }}>
        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.body2Semibold,
            color: colors.coolNeutral[80],
          }}
          numberOfLines={2}
        >
          {product.itemName}
        </Text>

        {/* 가격 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <PointIcon width={14} height={14} />
          <Text
            style={{
              fontFamily: typography.fontFamily.pretendard,
              ...typography.styles.body2Bold,
              color: colors.coolNeutral[60],
            }}
          >
            {formatPointNumber(product.requiredPoints)}
          </Text>
        </View>
      </View>

      {/* 구매자 수 */}
      <Text
        style={{
          fontFamily: typography.fontFamily.pretendard,
          ...typography.styles.body3Semibold,
          color: colors.coolNeutral[40],
        }}
      >
        {formatPointNumber(product.redeemCount)}명이 받아감
      </Text>
    </Pressable>
  );
}

// 남은 일수 계산 (ISO 날짜 문자열 지원)
function getDaysRemaining(expiredAt: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiredAt);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// 쿠폰 카드 컴포넌트 (API 응답 기반)
function CouponCard({ coupon, onUse }: { coupon: MemberCoupon; onUse?: () => void }) {
  const daysRemaining = getDaysRemaining(coupon.expiredAt);
  const isUrgent = daysRemaining <= 7;
  const expiryDateStr = formatDateOnly(coupon.expiredAt);

  return (
    <View
      style={{
        width: '100%',
        borderRadius: borderRadius.lg,
        backgroundColor: colors.coolNeutral[10],
        padding: 20,
        gap: 12,
      }}
    >
      {/* 브랜드명 + 쿠폰명 */}
      <View style={{ gap: 4 }}>
        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.captionRegular,
            color: colors.coolNeutral[40],
          }}
        >
          {coupon.brandName}
        </Text>

        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.body2Semibold,
            color: colors.coolNeutral[80],
          }}
        >
          {coupon.itemName}
        </Text>
      </View>

      {/* 남은 일수 + 만료일 + 포인트 */}
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text
            style={{
              fontFamily: typography.fontFamily.pretendard,
              ...typography.styles.captionMedium,
              color: isUrgent ? colors.red[40] : colors.primary[40],
            }}
          >
            {daysRemaining}일 남음
          </Text>
          <Text
            style={{
              fontFamily: typography.fontFamily.pretendard,
              ...typography.styles.captionMedium,
              color: colors.coolNeutral[40],
            }}
          >
            {expiryDateStr}까지
          </Text>
        </View>

        {/* 포인트 + 사용하기 버튼 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <PointIcon width={14} height={14} />
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body3Bold,
                color: colors.coolNeutral[40],
              }}
            >
              {formatPointNumber(coupon.usedPoints)}
            </Text>
          </View>

          <Pressable
            onPress={onUse}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: borderRadius.base,
              backgroundColor: colors.primary[50],
            }}
            accessibilityRole="button"
            accessibilityLabel={`use-coupon-${coupon.id}`}
          >
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body3Semibold,
                color: colors.coolNeutral[10],
              }}
            >
              사용하기
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function PointHistoryCard({ item }: { item: PointHistory }) {
  const router = useRouter();
  const isEarn = item.pointChange >= 0;
  const amountColor = isEarn ? colors.primary[50] : colors.red[50];

  // DRIVING 타입일 때 날짜와 거리 표시
  const displayDate = item.type === 'DRIVING' && item.drivingDetail
    ? formatDateOnly(item.drivingDetail.startDateTime)
    : formatDateOnly(item.date);
  const distanceKm = item.type === 'DRIVING' && item.drivingDetail
    ? item.drivingDetail.distanceKm
    : null;

  const TypeIcon = item.type === 'DRIVING'
    ? RcarIcon
    : item.type === 'ATTENDANCE'
      ? RcalIcon
      : RcouponIcon;

  const isDriving = item.type === 'DRIVING' && item.drivingDetail?.drivingRecordId;

  return (
    <Pressable
      style={{
        width: '100%',
        borderRadius: borderRadius.lg,
        backgroundColor: colors.coolNeutral[20],
        padding: 20,
        flexDirection: 'row',
        gap: 12,
      }}
      disabled={!isDriving}
      onPress={() => {
        if (isDriving) {
          router.push({
            pathname: '/car-detail',
            params: { drivingRecordId: String(item.drivingDetail!.drivingRecordId) },
          });
        }
      }}
    >
      {/* 타입 아이콘 */}
      <TypeIcon width={44} height={44} />

      {/* 내용 */}
      <View style={{ flex: 1, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Text
            style={{
              fontFamily: typography.fontFamily.pretendard,
              ...typography.styles.body2Semibold,
              color: colors.coolNeutral[90],
              flex: 1,
            }}
            numberOfLines={1}
          >
            {item.description}
          </Text>
          <Text
            style={{
              fontFamily: typography.fontFamily.pretendard,
              ...typography.styles.body2Bold,
              color: amountColor,
            }}
          >
            {formatPointDelta(item.pointChange)}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <CalendarIcon width={14} height={14} />
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.captionMedium,
                color: colors.coolNeutral[40],
              }}
            >
              {displayDate}
            </Text>
          </View>

          {distanceKm != null ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <GcarIcon width={14} height={14} />
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.captionMedium,
                  color: colors.coolNeutral[40],
                }}
              >
                {distanceKm} km
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export default function StoreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { accessToken } = useAuthStore();

  const rewardTabs = useMemo(
    () => [
      { id: 'store', label: '스토어' },
      { id: 'point', label: '포인트' },
      { id: 'coupon', label: '보유쿠폰' },
    ],
    [],
  );
  const [selectedTab, setSelectedTab] = useState<string>(rewardTabs[0]?.id ?? 'store');

  // 외부에서 tab 파라미터로 탭 전환
  useEffect(() => {
    if (params.tab && typeof params.tab === 'string') {
      setSelectedTab(params.tab);
    }
  }, [params.tab]);
  const [storeCategory, setStoreCategory] = useState<StoreCategoryKey>('ALL');
  const [visibleHistoryCount, setVisibleHistoryCount] = useState(4);
  const [visibleCouponCount, setVisibleCouponCount] = useState(4);
  const [selectedCoupon, setSelectedCoupon] = useState<MemberCoupon | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isUsageGuideExpanded, setIsUsageGuideExpanded] = useState(false);
  const [isBarcodeLarge, setIsBarcodeLarge] = useState(false);
  const [couponDetail, setCouponDetail] = useState<MemberCouponDetail | null>(null);
  const [isPointCardExpanded, setIsPointCardExpanded] = useState(false);

  const {
    storeCategories,
    rewardCoupons,
    couponsLoading,
    pointHistories,
    historyTotalCount,
    memberCoupons,
    couponTotalCount,
    pointTotal,
    pointBreakdown,
    fetchCouponDetailById,
  } = useStoreScreenData({
    accessToken,
    selectedTab,
    storeCategory,
  });

  // 탭별 배경색
  const backgroundColor = selectedTab === 'point' ? colors.coolNeutral[10] : colors.background.default;

  const handleCouponUse = async (coupon: MemberCoupon) => {
    setSelectedCoupon(coupon);
    setCouponDetail(null);
    setIsCouponModalOpen(true);
    setIsUsageGuideExpanded(false);

    const detail = await fetchCouponDetailById(coupon.id);
    setCouponDetail(detail);
  };

  const closeCouponModal = () => {
    setIsCouponModalOpen(false);
    setSelectedCoupon(null);
    setCouponDetail(null);
    setIsBarcodeLarge(false);
  };

  const navigateToDetail = (product: RewardCoupon) => {
    router.push({
      pathname: '/store-detail',
      params: {
        id: product.id.toString(),
        brand: product.brandName,
        name: product.itemName,
        price: product.requiredPoints.toString(),
        imageUrl: product.imageUrl,
      },
    });
  };

  const pointCardElement = (
    <StoreMyPointCard
      pointTotal={pointTotal}
      isExpanded={isPointCardExpanded}
      onToggle={() => setIsPointCardExpanded((v) => !v)}
      breakdown={pointBreakdown}
    />
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor }}>
      {/* 쿠폰 사용 모달 */}
      <OverlayModal
        visible={isCouponModalOpen}
        onBackdropPress={closeCouponModal}
        contentStyle={{
          backgroundColor: colors.coolNeutral[10],
          borderRadius: 20,
          paddingTop: 20,
          paddingBottom: 24,
          paddingHorizontal: 20,
          width: '100%',
          maxWidth: 355,
        }}
      >
        <StoreCouponUseModal
          selectedCoupon={selectedCoupon}
          couponDetail={couponDetail}
          isBarcodeLarge={isBarcodeLarge}
          isUsageGuideExpanded={isUsageGuideExpanded}
          onClose={closeCouponModal}
          onSetBarcodeLarge={setIsBarcodeLarge}
          onSetUsageGuideExpanded={setIsUsageGuideExpanded}
          BarcodeComponent={Barcode}
        />
      </OverlayModal>

      <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ alignItems: 'stretch', paddingBottom: 16 }}>
        <View style={{ width: '100%' }}>
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
                color: colors.coolNeutral[90],
              }}
            >
              리워드
            </Text>
          </View>

          {/* 탭 */}
          <CouponTab tabs={rewardTabs} selectedTab={selectedTab} onTabChange={setSelectedTab} />

          {selectedTab === 'store' ? (
            <StoreProductsSection
              pointCard={pointCardElement}
              storeCategory={storeCategory}
              storeCategories={storeCategories}
              onSelectCategory={setStoreCategory}
              couponsLoading={couponsLoading}
              rewardCoupons={rewardCoupons}
              renderProductCard={(product) => (
                <ProductCard
                  product={product}
                  onPress={() => navigateToDetail(product)}
                />
              )}
            />
          ) : selectedTab === 'point' ? (
            <StorePointHistorySection
              pointCard={pointCardElement}
              historyTotalCount={historyTotalCount}
              pointHistories={pointHistories}
              visibleHistoryCount={visibleHistoryCount}
              onMoreHistory={() => {
                setVisibleHistoryCount((prev) => Math.min(prev + 4, pointHistories.length));
              }}
              renderHistoryCard={(item, index) => (
                <PointHistoryCard key={`${item.date}-${index}`} item={item} />
              )}
            />
          ) : selectedTab === 'coupon' ? (
            <StoreCouponSection
              pointCard={pointCardElement}
              couponTotalCount={couponTotalCount}
              memberCoupons={memberCoupons}
              visibleCouponCount={visibleCouponCount}
              onMoreCoupons={() => {
                setVisibleCouponCount((prev) => Math.min(prev + 4, memberCoupons.length));
              }}
              renderCouponCard={(coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  onUse={() => handleCouponUse(coupon)}
                />
              )}
            />
          ) : null}
        </View>
      </ScrollView>

      <NavigationBar
        active="store"
        showBorder
        onPress={(tab) => router.push(getTabRoute(tab))}
      />
    </SafeAreaView>
  );
}

