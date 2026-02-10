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
import CategoryTab from '@/components/common/Category/CategoryTab';
import { useAuthStore } from '@/stores/authStore';
import {
  fetchRewardCategories,
  fetchRewardCoupons,
  fetchMemberPoints,
  fetchPointHistory,
  fetchMemberCoupons,
  fetchMemberCouponDetail,
  type MemberPoints,
  type RewardCategory,
  type RewardCoupon,
  type PointHistory,
  type MemberCoupon,
  type MemberCouponDetail,
} from '@/services/rewardService';

import ArrowLeftIcon from '../assets/icons/arrow-left.svg';
import DownIcon from '../assets/icons/DownIcon.svg';
import WDownIcon from '../assets/icons/wdown.svg';
import UpIcon from '../assets/icons/UpIcon.svg';
import XIcon from '../assets/icons/x_icon.svg';
import BlueDotIcon from '../assets/icons/bluedot.svg';
import PointIcon from '../assets/icons/point.svg';
import Coffee1Icon from '../assets/icons/coffee1.svg';
import CalendarIcon from '../assets/icons/calendar.svg';

import GcarIcon from '../assets/icons/gcar.svg';
import RcarIcon from '../assets/icons/rcar.svg';
import RcalIcon from '../assets/icons/rcal.svg';
import RcouponIcon from '../assets/icons/rcoupon.svg';
import WupIcon from '../assets/icons/wup.svg';

const SCREEN_MAX_WIDTH = 375;

// 고정 카테고리 (정렬 기준 sort 파라미터에 매핑)
const FIXED_CATEGORIES = [
  { key: 'ALL', label: '전체' },
  { key: 'POPULAR', label: '인기' },
  { key: 'CHEAP', label: '할인 높은 순' },
] as const;

// 고정 카테고리 key 목록 (sort 파라미터로 사용되는 값)
const FIXED_CATEGORY_KEYS = FIXED_CATEGORIES.map((c) => c.key as string);

type StoreCategoryKey = string;

const IMAGE_BASE_URL = 'https://api.caro.today';

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
            source={{ uri: `${IMAGE_BASE_URL}${product.imageUrl}` }}
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
            {product.requiredPoints.toLocaleString('ko-KR')}
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
        {product.redeemCount.toLocaleString('ko-KR')}명이 받아감
      </Text>
    </Pressable>
  );
}

// ISO 날짜 문자열에서 YYYY-MM-DD만 추출
function formatDateOnly(isoDate: string): string {
  return isoDate.slice(0, 10);
}

function formatPointAmount(amount: number) {
  const abs = Math.abs(amount).toLocaleString('ko-KR');
  return `${amount >= 0 ? '+ ' : '- '}${abs} P`;
}

function formatPointTotal(amount: number) {
  return `${amount.toLocaleString('ko-KR')}`;
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
              {coupon.usedPoints.toLocaleString('ko-KR')}
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

  return (
    <View
      style={{
        width: '100%',
        borderRadius: borderRadius.lg,
        backgroundColor: colors.coolNeutral[20],
        padding: 20,
        flexDirection: 'row',
        gap: 12,
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
            {formatPointAmount(item.pointChange)}
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
    </View>
  );
}

// 나의 포인트 카드 (펼침/접힘)
function PointCard({
  pointTotal,
  isExpanded,
  onToggle,
  breakdown,
}: {
  pointTotal: number;
  isExpanded: boolean;
  onToggle: () => void;
  breakdown: { attendance: number; driving: number; used: number };
}) {
  return (
    <View
      style={{
        width: '100%',
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
      }}
    >
      {/* 파란 영역 */}
      <Pressable
        onPress={onToggle}
        style={{
          backgroundColor: colors.primary[50],
          paddingHorizontal: 22,
          paddingVertical: 20,
          gap: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
          {isExpanded ? (
            <WupIcon width={22} height={22} />
          ) : (
            <WDownIcon width={22} height={22} />
          )}
        </View>
        {!isExpanded && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <PointIcon width={28} height={28} />
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.h1Bold,
                color: colors.coolNeutral[10],
              }}
            >
              {formatPointTotal(pointTotal)}
            </Text>
          </View>
        )}
      </Pressable>

      {/* 펼쳐진 상세 영역 */}
      {isExpanded && (
        <View
          style={{
            backgroundColor: colors.coolNeutral[10],
            paddingHorizontal: 20,
            paddingBottom: 20,
            paddingTop: 24,
            gap: 24,
          }}
        >
          {/* 항목들 */}
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: typography.fontFamily.pretendard, ...typography.styles.body3Medium, color: colors.coolNeutral[70] }}>
                출석체크 포인트
              </Text>
              <Text style={{ fontFamily: typography.fontFamily.pretendard, ...typography.styles.body3Bold, color: colors.coolNeutral[80] }}>
                {breakdown.attendance.toLocaleString('ko-KR')}P
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: typography.fontFamily.pretendard, ...typography.styles.body3Medium, color: colors.coolNeutral[70] }}>
                운행기록 포인트
              </Text>
              <Text style={{ fontFamily: typography.fontFamily.pretendard, ...typography.styles.body3Bold, color: colors.coolNeutral[80] }}>
                {breakdown.driving.toLocaleString('ko-KR')}P
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: typography.fontFamily.pretendard, ...typography.styles.body3Medium, color: colors.red[40] }}>
                나의 차감 포인트
              </Text>
              <Text style={{ fontFamily: typography.fontFamily.pretendard, ...typography.styles.body3Bold, color: colors.red[40] }}>
                -{breakdown.used.toLocaleString('ko-KR')}P
              </Text>
            </View>
          </View>

          {/* 구분선 */}
          <View style={{ height: 2, backgroundColor: colors.coolNeutral[80] }} />

          {/* 현재 포인트 */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: typography.fontFamily.pretendard, ...typography.styles.body2Bold, color: colors.coolNeutral[90] }}>
              현재 포인트
            </Text>
            <Text style={{ fontFamily: typography.fontFamily.pretendard, ...typography.styles.h1Bold, color: colors.primary[50] }}>
              {pointTotal.toLocaleString('ko-KR')} P
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

export default function StoreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { accessToken } = useAuthStore();
  const [memberPoints, setMemberPoints] = useState<MemberPoints | null>(null);

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
  const [apiCategories, setApiCategories] = useState<RewardCategory[]>([]);
  const [rewardCoupons, setRewardCoupons] = useState<RewardCoupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [pointHistories, setPointHistories] = useState<PointHistory[]>([]);
  const [historyTotalCount, setHistoryTotalCount] = useState(0);
  const [memberCoupons, setMemberCoupons] = useState<MemberCoupon[]>([]);
  const [couponTotalCount, setCouponTotalCount] = useState(0);
  const [couponDetail, setCouponDetail] = useState<MemberCouponDetail | null>(null);
  const [isPointCardExpanded, setIsPointCardExpanded] = useState(false);

  // API에서 포인트 정보 가져오기
  useEffect(() => {
    if (accessToken) {
      fetchMemberPoints()
        .then(setMemberPoints)
        .catch((err) => console.warn('포인트 조회 실패:', err));
    }
  }, [accessToken]);

  // API에서 리워드 카테고리 가져오기
  useEffect(() => {
    fetchRewardCategories()
      .then((data) => setApiCategories(data))
      .catch((err) => console.warn('카테고리 조회 실패:', err));
  }, []);

  // 고정 카테고리 + API 카테고리 결합
  const storeCategories = useMemo(() => {
    const fixed = FIXED_CATEGORIES.map((c) => ({ key: c.key, label: c.label }));
    const dynamic = apiCategories.map((c) => ({
      key: c.category,
      label: c.categoryLabel,
    }));
    return [...fixed, ...dynamic];
  }, [apiCategories]);

  // 카테고리/정렬 변경 시 쿠폰 목록 API 호출
  useEffect(() => {
    const isFixedCategory = FIXED_CATEGORY_KEYS.includes(storeCategory);
    const params = isFixedCategory
      ? { sort: storeCategory, size: 20 }
      : { category: storeCategory, size: 20 };

    setCouponsLoading(true);
    fetchRewardCoupons(params)
      .then((data) => setRewardCoupons(data.rewardCoupons))
      .catch((err) => {
        console.warn('쿠폰 목록 조회 실패:', err);
        setRewardCoupons([]);
      })
      .finally(() => setCouponsLoading(false));
  }, [storeCategory]);

  const pointTotal = memberPoints?.availablePoints ?? 0;

  const pointBreakdown = useMemo(() => ({
    attendance: memberPoints?.totalAttendancePoints ?? 0,
    driving: memberPoints?.totalDrivingPoints ?? 0,
    used: memberPoints?.totalUsedPoints ?? 0,
  }), [memberPoints]);

  // 포인트 이력 API 호출 (모든 탭에서 breakdown 계산에 필요)
  useEffect(() => {
    fetchPointHistory()
      .then((data) => {
        setPointHistories(data.histories);
        setHistoryTotalCount(data.totalCount);
      })
      .catch((err) => {
        console.warn('포인트 이력 조회 실패:', err);
        setPointHistories([]);
        setHistoryTotalCount(0);
      });
  }, []);

  // 보유쿠폰 API 호출
  useEffect(() => {
    if (selectedTab === 'coupon') {
      fetchMemberCoupons()
        .then((data) => {
          setMemberCoupons(data.coupons);
          setCouponTotalCount(data.totalCount);
        })
        .catch((err) => {
          console.warn('보유쿠폰 조회 실패:', err);
          setMemberCoupons([]);
          setCouponTotalCount(0);
        });
    }
  }, [selectedTab]);

  // 탭별 배경색
  const backgroundColor = selectedTab === 'point' ? colors.coolNeutral[10] : colors.background.default;

  // 날짜 포맷 함수
  const formatExpiryDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}년 ${month}월 ${day}일까지`;
  };

  const formatExchangeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year} . ${month} . ${day}`;
  };

  const handleCouponUse = async (coupon: MemberCoupon) => {
    setSelectedCoupon(coupon);
    setCouponDetail(null);
    setIsCouponModalOpen(true);
    setIsUsageGuideExpanded(false);

    try {
      const detail = await fetchMemberCouponDetail(coupon.id);
      setCouponDetail(detail);
    } catch (err) {
      console.warn('쿠폰 상세 조회 실패:', err);
    }
  };

  const closeCouponModal = () => {
    setIsCouponModalOpen(false);
    setSelectedCoupon(null);
    setCouponDetail(null);
    setIsBarcodeLarge(false);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor }}>
      {/* 쿠폰 사용 모달 */}
      {isCouponModalOpen && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          {/* 배경 터치 영역 */}
          <Pressable
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={closeCouponModal}
          />
          
          {/* 모달 카드 */}
          <View
            style={{
              backgroundColor: colors.coolNeutral[10],
              borderRadius: 20,
              paddingTop: 20,
              paddingBottom: 24,
              paddingHorizontal: 20,
              width: '100%',
              maxWidth: 355,
            }}
          >
            {/* X 아이콘 영역 */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginBottom: 20,
              }}
            >
              <Pressable
                onPress={closeCouponModal}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="close-modal"
              >
                <XIcon width={24} height={24} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedCoupon && !isBarcodeLarge && (
                <View style={{ gap: 16 }}>
                  {/* 쿠폰 상단 영역 */}
                  <View
                    style={{
                      alignItems: 'center',
                      gap: 24,
                    }}
                  >
                    {/* 쿠폰 제목 */}
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.h2Semibold,
                        color: colors.coolNeutral[90],
                        textAlign: 'center',
                      }}
                    >
                      {couponDetail
                        ? `[${couponDetail.brandName}]\n${couponDetail.itemName}`
                        : `[${selectedCoupon.brandName}]\n${selectedCoupon.itemName}`}
                    </Text>

                    {/* 브랜드 로고 */}
                    {couponDetail?.imageUrl ? (
                      <Image
                        source={{ uri: `https://api.caro.today${couponDetail.imageUrl}` }}
                        style={{ width: 80, height: 80, borderRadius: 40 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 40,
                          backgroundColor: '#00704A',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
                          {selectedCoupon.brandName}
                        </Text>
                      </View>
                    )}

                    {/* 바코드 */}
                    <View
                      style={{
                        width: '100%',
                        backgroundColor: colors.background.default,
                        borderRadius: borderRadius.md,
                        borderWidth: 1,
                        borderColor: colors.coolNeutral[20],
                        paddingVertical: 24,
                        paddingHorizontal: 20,
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      {Barcode ? (
                        <Barcode
                          value={couponDetail?.barcodeNumber || String(selectedCoupon.id)}
                          format="CODE128"
                          height={52}
                          maxWidth={280}
                          singleBarWidth={2}
                          lineColor="#000000"
                          backgroundColor="#FFFFFF"
                          onError={(err: Error) => console.log('Barcode error:', err)}
                        />
                      ) : (
                        <View style={{ height: 52, justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ fontFamily: typography.fontFamily.pretendard, ...typography.styles.body2Medium, color: colors.coolNeutral[60], letterSpacing: 4 }}>
                            {couponDetail?.barcodeNumber || selectedCoupon.id}
                          </Text>
                        </View>
                      )}
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body3Medium,
                          color: colors.coolNeutral[80],
                        }}
                      >
                        {couponDetail?.barcodeNumber || selectedCoupon.id}
                      </Text>
                    </View>
                  </View>

                  {/* 쿠폰 정보 */}
                  <View style={{ gap: 12 }}>
                    {/* 유효기간 */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text
                        style={{
                          width: 70,
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body3Regular,
                          color: colors.coolNeutral[50],
                        }}
                      >
                        유효기간
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body2Semibold,
                            color: colors.coolNeutral[90],
                          }}
                        >
                          {formatExpiryDate(couponDetail?.expiredAt || selectedCoupon.expiredAt)}
                        </Text>
                        <View
                          style={{
                            backgroundColor: colors.red[40],
                            borderRadius: borderRadius.base,
                            paddingHorizontal: 8,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.body2Bold,
                              color: colors.coolNeutral[10],
                            }}
                          >
                            D-{getDaysRemaining(couponDetail?.expiredAt || selectedCoupon.expiredAt)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* 사용처 */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text
                        style={{
                          width: 70,
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body3Regular,
                          color: colors.coolNeutral[50],
                        }}
                      >
                        사용처
                      </Text>
                      <Text
                        style={{
                          flex: 1,
                          textAlign: 'right',
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body2Semibold,
                          color: colors.coolNeutral[90],
                        }}
                      >
                        {(couponDetail?.brandName || selectedCoupon.brandName)} 모든 매장
                      </Text>
                    </View>

                    {/* 교환일 */}
                    {couponDetail?.exchangedAt && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text
                          style={{
                            width: 70,
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body3Regular,
                            color: colors.coolNeutral[50],
                          }}
                        >
                          교환일
                        </Text>
                        <Text
                          style={{
                            flex: 1,
                            textAlign: 'right',
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body2Semibold,
                            color: colors.coolNeutral[90],
                          }}
                        >
                          {formatExchangeDate(couponDetail.exchangedAt)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* 바코드 크게 보기 버튼 + 사용 안내 */}
                  <View style={{ gap: 24 }}>
                    <Pressable
                      onPress={() => setIsBarcodeLarge(true)}
                      style={{
                        width: '100%',
                        height: 52,
                        borderRadius: borderRadius.md,
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
                        바코드 크게 보기
                      </Text>
                    </Pressable>

                    {/* 사용 안내 */}
                    <View>
                    {!isUsageGuideExpanded ? (
                      // 접혀있을 때: "사용 안내 v" 버튼
                      <Pressable
                        onPress={() => setIsUsageGuideExpanded(true)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body3Medium,
                            color: colors.coolNeutral[50],
                          }}
                        >
                          사용 안내
                        </Text>
                        <DownIcon width={16} height={16} />
                      </Pressable>
                    ) : (
                      // 펼쳐졌을 때: 내용 카드 + "접기 ^" 버튼
                      <View style={{ gap: 8 }}>
                        {/* 내용 카드 */}
                        <View
                          style={{
                            backgroundColor: colors.coolNeutral[20],
                            borderRadius: borderRadius.lg,
                            padding: 20,
                            gap: 8,
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <BlueDotIcon width={4} height={4} />
                            <Text
                              style={{
                                fontFamily: typography.fontFamily.pretendard,
                                ...typography.styles.body3Regular,
                                color: colors.coolNeutral[50],
                              }}
                            >
                              결제 시 바코드를 제시해주세요.
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <BlueDotIcon width={4} height={4} />
                            <Text
                              style={{
                                fontFamily: typography.fontFamily.pretendard,
                                ...typography.styles.body3Regular,
                                color: colors.coolNeutral[50],
                              }}
                            >
                              다른 쿠폰과 중복 사용 불가해요
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <BlueDotIcon width={4} height={4} />
                            <Text
                              style={{
                                fontFamily: typography.fontFamily.pretendard,
                                ...typography.styles.body3Regular,
                                color: colors.coolNeutral[50],
                              }}
                            >
                              유효기간 경과 시 자동 소멸 되어요.
                            </Text>
                          </View>
                        </View>

                        {/* 접기 버튼 */}
                        <Pressable
                          onPress={() => setIsUsageGuideExpanded(false)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.body3Medium,
                              color: colors.coolNeutral[50],
                            }}
                          >
                            접기
                          </Text>
                          <UpIcon width={16} height={16} />
                        </Pressable>
                      </View>
                    )}
                    </View>
                  </View>
                </View>
              )}

              {/* 바코드 크게 보기 */}
              {selectedCoupon && isBarcodeLarge && (
                <View style={{ gap: 24 }}>
                  {/* 쿠폰 제목 */}
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.h2Semibold,
                      color: colors.coolNeutral[90],
                      textAlign: 'center',
                    }}
                  >
                      {couponDetail
                        ? `[${couponDetail.brandName}]\n${couponDetail.itemName}`
                        : `[${selectedCoupon.brandName}]\n${selectedCoupon.itemName}`}
                  </Text>

                  {/* 큰 바코드 */}
                  <View
                    style={{
                      width: '100%',
                      backgroundColor: colors.background.default,
                      borderRadius: borderRadius.md,
                      borderWidth: 1,
                      borderColor: colors.coolNeutral[20],
                      paddingVertical: 40,
                      paddingHorizontal: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 370,
                    }}
                  >
                    {/* 바코드 + 번호 전체를 90도 오른쪽으로 회전 */}
                    <View
                      style={{
                        transform: [{ rotate: '90deg' }],
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      {Barcode ? (
                        <Barcode
                          value={couponDetail?.barcodeNumber || String(selectedCoupon.id)}
                          format="CODE128"
                          height={150}
                          maxWidth={310}
                          singleBarWidth={5}
                          lineColor="#000000"
                          backgroundColor="#FFFFFF"
                          onError={(err: Error) => console.log('Barcode error:', err)}
                        />
                      ) : (
                        <View style={{ height: 150, justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ fontFamily: typography.fontFamily.pretendard, ...typography.styles.h2Semibold, color: colors.coolNeutral[60], letterSpacing: 6 }}>
                            {couponDetail?.barcodeNumber || selectedCoupon.id}
                          </Text>
                        </View>
                      )}
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body2Medium,
                          color: colors.coolNeutral[80],
                        }}
                      >
                        {couponDetail?.barcodeNumber || selectedCoupon.id}
                      </Text>
                    </View>
                  </View>

                  {/* 바코드 작게 보기 버튼 */}
                  <Pressable
                    onPress={() => setIsBarcodeLarge(false)}
                    style={{
                      width: '100%',
                      height: 52,
                      borderRadius: borderRadius.md,
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
                      바코드 작게 보기
                    </Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}

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
            <View style={{ paddingTop: 18, gap: 37.5 }}>
              {/* 포인트 카드 */}
              <View style={{ paddingHorizontal: 20 }}>
                <PointCard
                  pointTotal={pointTotal}
                  isExpanded={isPointCardExpanded}
                  onToggle={() => setIsPointCardExpanded((v) => !v)}
                  breakdown={pointBreakdown}
                />
              </View>

              {/* 카테고리 탭 + 상품 목록 */}
              <View style={{ gap: 28.5 }}>
                {/* 스토어 카테고리 탭 */}
                <View style={{ paddingHorizontal: 20 }}>
                  <CategoryTab
                    selected={storeCategory}
                    onSelect={setStoreCategory}
                    categories={storeCategories}
                    variant="store"
                    dividerAfterIndex={2}
                  />
                </View>

                {/* 전체 섹션 헤더 + 상품 그리드 */}
                <View style={{ gap: 12 }}>
                  <View style={{ paddingHorizontal: 20 }}>
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.h3Bold,
                        color: colors.coolNeutral[90],
                      }}
                    >
                      {storeCategories.find((c) => c.key === storeCategory)?.label ?? '전체'}
                    </Text>
                  </View>

                  {/* 상품 그리드 */}
                  <View style={{ paddingHorizontal: 20, gap: 16 }}>
                    {couponsLoading ? (
                      <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body2Semibold,
                            color: colors.coolNeutral[40],
                          }}
                        >
                          불러오는 중...
                        </Text>
                      </View>
                    ) : rewardCoupons.length === 0 ? (
                      <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body2Semibold,
                            color: colors.coolNeutral[40],
                          }}
                        >
                          상품이 없습니다
                        </Text>
                      </View>
                    ) : (
                      /* 2열 그리드로 상품 표시 */
                      Array.from({ length: Math.ceil(rewardCoupons.length / 2) }).map((_, rowIndex) => {
                        const product1 = rewardCoupons[rowIndex * 2];
                        const product2 = rewardCoupons[rowIndex * 2 + 1];

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

                        return (
                          <View key={rowIndex} style={{ flexDirection: 'row', gap: 19 }}>
                            {product1 && (
                              <ProductCard
                                product={product1}
                                onPress={() => navigateToDetail(product1)}
                              />
                            )}
                            {product2 ? (
                              <ProductCard
                                product={product2}
                                onPress={() => navigateToDetail(product2)}
                              />
                            ) : (
                              <View style={{ flex: 1 }} />
                            )}
                          </View>
                        );
                      })
                    )}
                  </View>
                </View>
              </View>
            </View>
          ) : selectedTab === 'point' ? (
            <View style={{ paddingHorizontal: 20, paddingTop: 18, gap: 30 }}>
              {/* 포인트 카드 */}
              <PointCard
                pointTotal={pointTotal}
                isExpanded={isPointCardExpanded}
                onToggle={() => setIsPointCardExpanded((v) => !v)}
                breakdown={pointBreakdown}
              />

              {/* 리스트 헤더 + 히스토리 카드들 */}
              <View style={{ gap: 20 }}>
                {/* 리스트 헤더 */}
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
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
                    {historyTotalCount}건
                  </Text>
                </View>

                {/* 히스토리 카드들 */}
                <View style={{ gap: 12 }}>
                  {pointHistories.slice(0, visibleHistoryCount).map((item, index) => (
                    <PointHistoryCard key={`${item.date}-${index}`} item={item} />
                  ))}
                </View>

                {/* 더보기 */}
                {visibleHistoryCount < pointHistories.length && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="more"
                    style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
                    onPress={() => {
                      setVisibleHistoryCount((prev) => Math.min(prev + 4, pointHistories.length));
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
                )}
              </View>
            </View>
          ) : selectedTab === 'coupon' ? (
            <View style={{ paddingHorizontal: 20, paddingTop: 18, gap: 30 }}>
              {/* 포인트 카드 */}
              <PointCard
                pointTotal={pointTotal}
                isExpanded={isPointCardExpanded}
                onToggle={() => setIsPointCardExpanded((v) => !v)}
                breakdown={pointBreakdown}
              />

              {/* 보유쿠폰 리스트 */}
              <View style={{ gap: 20 }}>
                {/* 리스트 헤더 */}
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.h3Bold,
                      color: colors.coolNeutral[90],
                    }}
                  >
                    보유쿠폰
                  </Text>
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.h3Bold,
                      color: colors.primary[50],
                    }}
                  >
                    {couponTotalCount}개
                  </Text>
                </View>

                {/* 쿠폰 카드들 */}
                <View style={{ gap: 12 }}>
                  {memberCoupons.slice(0, visibleCouponCount).map((coupon) => (
                    <CouponCard
                      key={coupon.id}
                      coupon={coupon}
                      onUse={() => handleCouponUse(coupon)}
                    />
                  ))}
                </View>

                {/* 더보기 */}
                {visibleCouponCount < memberCoupons.length && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="more-coupons"
                    style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
                    onPress={() => {
                      setVisibleCouponCount((prev) => Math.min(prev + 4, memberCoupons.length));
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
                )}
              </View>
            </View>
          ) : null}
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

