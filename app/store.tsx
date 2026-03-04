import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { borderRadius, colors, typography } from '@/theme';
import { NavigationBar } from '@/components/common/Bar/NavigationBar';
import CouponTab from '@/components/common/Category/CouponTab';
import { StoreCouponCard } from '@/components/store/cards/StoreCouponCard';
import { StoreMyPointCard } from '@/components/store/cards/StoreMyPointCard';
import { StorePointHistoryCard } from '@/components/store/cards/StorePointHistoryCard';
import { StoreProductCard } from '@/components/store/cards/StoreProductCard';
import { OverlayModal } from '@/components/common/Modal/OverlayModal';
import { StoreCouponUseModal, type StoreBarcodeComponent } from '@/components/store/modals/StoreCouponUseModal';
import {
  StoreCouponSection,
  StorePointHistorySection,
  StoreProductsSection,
} from '@/components/store/sections/StoreTabSections';
import { StoreDetailSection } from '@/components/store/sections/StoreDetailSection';
import { useStoreScreenData } from '@/hooks/store/useStoreScreenData';
import { useAuthStore } from '@/stores/authStore';
import {
  type RewardCoupon,
  type MemberCoupon,
  type MemberCouponDetail,
} from '@/services/rewardService';
import { getTabRoute } from '@/utils/navigation';

import ArrowLeftIcon from '@/assets/icons/arrow-left.svg';

type StoreCategoryKey = string;
type StoreTabId = 'store' | 'point' | 'coupon';

function isStoreTabId(value: string): value is StoreTabId {
  return value === 'store' || value === 'point' || value === 'coupon';
}

// 네이티브 전용 바코드 컴포넌트 - 웹에서는 텍스트 대체
let Barcode: StoreBarcodeComponent = null;
if (Platform.OS !== 'web') {
  Barcode = require('react-native-barcode-svg').default as StoreBarcodeComponent;
}

export default function StoreScreen() {
  const router = useRouter();
  const { accessToken } = useAuthStore();

  const rewardTabs = useMemo(
    () =>
      [
        { id: 'store', label: '스토어' },
        { id: 'point', label: '포인트' },
        { id: 'coupon', label: '보유쿠폰' },
      ] as const,
    [],
  );
  const [selectedTab, setSelectedTab] = useState<StoreTabId>('store');
  const [storeCategory, setStoreCategory] = useState<StoreCategoryKey>('ALL');
  const [visibleHistoryCount, setVisibleHistoryCount] = useState(4);
  const [visibleCouponCount, setVisibleCouponCount] = useState(4);
  const [selectedCoupon, setSelectedCoupon] = useState<MemberCoupon | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isUsageGuideExpanded, setIsUsageGuideExpanded] = useState(false);
  const [isBarcodeLarge, setIsBarcodeLarge] = useState(false);
  const [couponDetail, setCouponDetail] = useState<MemberCouponDetail | null>(null);
  const [isPointCardExpanded, setIsPointCardExpanded] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<RewardCoupon | null>(null);

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

  const handleOpenDetail = (product: RewardCoupon) => {
    setSelectedProduct(product);
  };

  const handleCloseDetail = () => {
    setSelectedProduct(null);
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
      {selectedProduct ? (
        <StoreDetailSection
          product={selectedProduct}
          accessToken={accessToken}
          onBack={handleCloseDetail}
          onExchanged={() => setSelectedTab('coupon')}
        />
      ) : (
        <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ alignItems: 'stretch', paddingBottom: 16 }}>
          <View style={{ width: '100%' }}>
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

            <CouponTab
              tabs={rewardTabs.map((tab) => ({ ...tab }))}
              selectedTab={selectedTab}
              onTabChange={(tabId) => {
                if (isStoreTabId(tabId)) {
                  setSelectedTab(tabId);
                }
              }}
            />

            {selectedTab === 'store' ? (
              <StoreProductsSection
                pointCard={pointCardElement}
                storeCategory={storeCategory}
                storeCategories={storeCategories}
                onSelectCategory={setStoreCategory}
                couponsLoading={couponsLoading}
                rewardCoupons={rewardCoupons}
                renderProductCard={(product) => (
                  <StoreProductCard
                    product={product}
                    onPress={() => handleOpenDetail(product)}
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
                  <StorePointHistoryCard key={`${item.date}-${index}`} item={item} />
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
                  <StoreCouponCard
                    key={coupon.id}
                    coupon={coupon}
                    onUse={() => handleCouponUse(coupon)}
                  />
                )}
              />
            ) : null}
          </View>
        </ScrollView>
      )}

      <NavigationBar
        active="store"
        showBorder
        onPress={(tab) => router.push(getTabRoute(tab))}
      />
    </SafeAreaView>
  );
}

