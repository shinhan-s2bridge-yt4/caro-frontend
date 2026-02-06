import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View, Image, Modal } from 'react-native';
import Barcode from 'react-native-barcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, typography } from '@/theme';
import { NavigationBar } from '@/components/common/Bar/NavigationBar';
import CouponTab from '@/components/common/Category/CouponTab';
import CategoryTab from '@/components/common/Category/CategoryTab';
import { useDrivingRecordStore } from '@/stores/drivingRecordStore';
import { useAuthStore } from '@/stores/authStore';

import ArrowLeftIcon from '../assets/icons/arrow-left.svg';
import DownIcon from '../assets/icons/DownIcon.svg';
import UpIcon from '../assets/icons/UpIcon.svg';
import XIcon from '../assets/icons/x_icon.svg';
import BlueDotIcon from '../assets/icons/bluedot.svg';
import PointIcon from '../assets/icons/point.svg';
import BCoinIcon from '../assets/icons/bcoin.svg';
import Coffee1Icon from '../assets/icons/coffee1.svg';
import Coffee2Icon from '../assets/icons/coffee2.svg';
import Coffee3Icon from '../assets/icons/coffee3.svg';
import BugerIcon from '../assets/icons/buger.svg';
import CalendarIcon from '../assets/icons/calendar.svg';
import ClockIcon from '../assets/icons/clock.svg';
import GcarIcon from '../assets/icons/gcar.svg';

const SCREEN_MAX_WIDTH = 375;

// 스토어 카테고리
const STORE_CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'popular', label: '인기' },
  { key: 'discount', label: '할인 높은 순' },
  { key: 'gas', label: '주유소' },
  { key: 'cafe', label: '카페' },
] as const;

type StoreCategoryKey = typeof STORE_CATEGORIES[number]['key'];

// 스토어 상품 타입
type StoreProduct = {
  id: string;
  brand: string;
  name: string;
  price: number;
  buyerCount: number;
  imageType: 'coffee1' | 'coffee2' | 'coffee3' | 'buger';
  category: StoreCategoryKey[];
};

// 스토어 상품 데이터
const STORE_PRODUCTS: StoreProduct[] = [
  {
    id: 'p1',
    brand: '스타벅스',
    name: '아이스 커피 더블샷 Tall 모바일 교환권',
    price: 6500,
    buyerCount: 3270,
    imageType: 'coffee1',
    category: ['all', 'popular', 'cafe'],
  },
  {
    id: 'p2',
    brand: '스타벅스',
    name: '아이스 카페모카 Tall 모바일 교환권',
    price: 5000,
    buyerCount: 3270,
    imageType: 'coffee2',
    category: ['all', 'cafe'],
  },
  {
    id: 'p3',
    brand: '스타벅스',
    name: '아이스 아메리카노 Tall 모바일 교환권',
    price: 6500,
    buyerCount: 3270,
    imageType: 'coffee3',
    category: ['all', 'discount', 'cafe'],
  },
  {
    id: 'p4',
    brand: '스타벅스',
    name: '더오치 맥시멈 3 세트 교환권',
    price: 5000,
    buyerCount: 3270,
    imageType: 'buger',
    category: ['all', 'popular'],
  },
];

// 상품 이미지 컴포넌트
function ProductImage({ type, size = 100 }: { type: StoreProduct['imageType']; size?: number | string }) {
  switch (type) {
    case 'coffee1':
      return <Coffee1Icon width={size} height={size} />;
    case 'coffee2':
      return <Coffee2Icon width={size} height={size} />;
    case 'coffee3':
      return <Coffee3Icon width={size} height={size} />;
    case 'buger':
      return <BugerIcon width={size} height={size} />;
    default:
      return <Coffee1Icon width={size} height={size} />;
  }
}

// 상품 카드 컴포넌트
function ProductCard({ product, onPress }: { product: StoreProduct; onPress?: () => void }) {
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
        }}
      >
        <ProductImage type={product.imageType} size="100%" />
      </View>

      {/* 브랜드명 */}
      <Text
        style={{
          fontFamily: typography.fontFamily.pretendard,
          ...typography.styles.body3Semibold,
          color: colors.coolNeutral[60],
        }}
      >
        {product.brand}
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
          {product.name}
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
            {product.price.toLocaleString('ko-KR')}
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
        {product.buyerCount.toLocaleString('ko-KR')}명이 받아감
      </Text>
    </Pressable>
  );
}

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

// 보유쿠폰 타입
type MyCoupon = {
  id: string;
  brand: string;
  name: string;
  expiryDate: string; // YYYY-MM-DD
  price: number;
  barcode: string;
  usageLocation: string;
  exchangeDate: string; // YYYY-MM-DD
};

// 남은 일수 계산
function getDaysRemaining(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// 랜덤 바코드 생성 함수
function generateRandomBarcode(): string {
  let barcode = '880';
  for (let i = 0; i < 10; i++) {
    barcode += Math.floor(Math.random() * 10).toString();
  }
  return barcode;
}

// 보유쿠폰 더미 데이터
const MY_COUPONS: MyCoupon[] = [
  {
    id: 'c1',
    brand: '스타벅스',
    name: '[스타벅스] 3천원 모바일 쿠폰',
    expiryDate: '2026-02-09',
    price: 5000,
    barcode: '8801234567890',
    usageLocation: '스타벅스 모든 매장',
    exchangeDate: '2026-01-28',
  },
  {
    id: 'c2',
    brand: '스타벅스',
    name: '[스타벅스] 3천원 모바일 쿠폰',
    expiryDate: '2026-02-17',
    price: 5000,
    barcode: '8809876543210',
    usageLocation: '스타벅스 모든 매장',
    exchangeDate: '2026-01-28',
  },
  {
    id: 'c3',
    brand: '스타벅스',
    name: '[스타벅스] 3천원 모바일 쿠폰',
    expiryDate: '2026-02-17',
    price: 5000,
    barcode: '8801122334455',
    usageLocation: '스타벅스 모든 매장',
    exchangeDate: '2026-01-28',
  },
  {
    id: 'c4',
    brand: '스타벅스',
    name: '[스타벅스] 3천원 모바일 쿠폰',
    expiryDate: '2026-02-17',
    price: 5000,
    barcode: '8805566778899',
    usageLocation: '스타벅스 모든 매장',
    exchangeDate: '2026-01-28',
  },
];

// 쿠폰 카드 컴포넌트
function CouponCard({ coupon, onUse }: { coupon: MyCoupon; onUse?: () => void }) {
  const daysRemaining = getDaysRemaining(coupon.expiryDate);
  const isUrgent = daysRemaining <= 7;

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
          {coupon.brand}
        </Text>

        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.body2Semibold,
            color: colors.coolNeutral[80],
          }}
        >
          {coupon.name}
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
            {coupon.expiryDate}까지
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
            {coupon.price.toLocaleString('ko-KR')}
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
        paddingBottom: 12,
        paddingTop: 20,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.body2Semibold,
            color: colors.coolNeutral[90],
          }}
        >
          {item.title}
        </Text>
        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.body2Bold,
            color: amountColor,
          }}
        >
          {formatPointAmount(item.amount)}
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
            {item.date}
          </Text>
        </View>

        {item.meta?.durationLabel ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <ClockIcon width={14} height={14} />
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.captionMedium,
                color: colors.coolNeutral[40],
              }}
            >
              {item.meta.durationLabel}
            </Text>
          </View>
        ) : null}

        {item.meta?.distanceLabel ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <GcarIcon width={14} height={14} />
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.captionMedium,
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
  const { accessToken } = useAuthStore();
  const { summary, fetchSummary } = useDrivingRecordStore();

  const rewardTabs = useMemo(
    () => [
      { id: 'store', label: '스토어' },
      { id: 'point', label: '포인트' },
      { id: 'coupon', label: '보유쿠폰' },
    ],
    [],
  );
  const [selectedTab, setSelectedTab] = useState<string>(rewardTabs[0]?.id ?? 'store');
  const [storeCategory, setStoreCategory] = useState<StoreCategoryKey>('all');
  const [visibleHistoryCount, setVisibleHistoryCount] = useState(4);
  const [visibleCouponCount, setVisibleCouponCount] = useState(4);
  const [selectedCoupon, setSelectedCoupon] = useState<MyCoupon | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isUsageGuideExpanded, setIsUsageGuideExpanded] = useState(false);
  const [isBarcodeLarge, setIsBarcodeLarge] = useState(false);

  // API에서 포인트 정보 가져오기
  useEffect(() => {
    if (accessToken) {
      fetchSummary({ accessToken });
    }
  }, [accessToken, fetchSummary]);

  const pointTotal = summary?.totalEarnedPoints ?? 0;

  // 카테고리별 필터링된 상품
  const filteredProducts = useMemo(() => {
    return STORE_PRODUCTS.filter((product) => product.category.includes(storeCategory));
  }, [storeCategory]);

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

  const handleCouponUse = (coupon: MyCoupon) => {
    setSelectedCoupon(coupon);
    setIsCouponModalOpen(true);
    setIsUsageGuideExpanded(false);
  };

  const closeCouponModal = () => {
    setIsCouponModalOpen(false);
    setSelectedCoupon(null);
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
                      {selectedCoupon.name.replace('[스타벅스] ', '[스타벅스]\n')}
                    </Text>

                    {/* 브랜드 로고 (placeholder) */}
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
                        STARBUCKS
                      </Text>
                    </View>

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
                      <Barcode
                        value={selectedCoupon.barcode}
                        format="CODE128"
                        height={52}
                        maxWidth={280}
                        singleBarWidth={2}
                        lineColor="#000000"
                        backgroundColor="#FFFFFF"
                        onError={(err: Error) => console.log('Barcode error:', err)}
                      />
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body3Medium,
                          color: colors.coolNeutral[80],
                        }}
                      >
                        {selectedCoupon.barcode}
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
                          {formatExpiryDate(selectedCoupon.expiryDate)}
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
                            D-{getDaysRemaining(selectedCoupon.expiryDate)}
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
                        {selectedCoupon.usageLocation}
                      </Text>
                    </View>

                    {/* 교환일 */}
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
                        {formatExchangeDate(selectedCoupon.exchangeDate)}
                      </Text>
                    </View>
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
                    {selectedCoupon.name.replace('[스타벅스] ', '[스타벅스]\n')}
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
                      <Barcode
                        value={selectedCoupon.barcode}
                        format="CODE128"
                        height={150}
                        maxWidth={310}
                        singleBarWidth={5}
                        lineColor="#000000"
                        backgroundColor="#FFFFFF"
                        onError={(err: Error) => console.log('Barcode error:', err)}
                      />
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body2Medium,
                          color: colors.coolNeutral[80],
                        }}
                      >
                        {selectedCoupon.barcode}
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
                <View
                  style={{
                    width: '100%',
                    borderRadius: borderRadius.lg,
                    backgroundColor: colors.primary[50],
                    paddingHorizontal: 22,
                    paddingVertical: 20,
                    gap: 12,
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
                  <View style={{ gap: 4 }}>
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.h1Bold,
                        color: colors.coolNeutral[10],
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
                </View>
              </View>

              {/* 카테고리 탭 + 상품 목록 */}
              <View style={{ gap: 28.5 }}>
                {/* 스토어 카테고리 탭 */}
                <View style={{ paddingHorizontal: 20 }}>
                  <CategoryTab
                    selected={storeCategory}
                    onSelect={setStoreCategory}
                    categories={STORE_CATEGORIES as unknown as { key: StoreCategoryKey; label: string }[]}
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
                      {STORE_CATEGORIES.find((c) => c.key === storeCategory)?.label ?? '전체'}
                    </Text>
                  </View>

                  {/* 상품 그리드 */}
                  <View style={{ paddingHorizontal: 20, gap: 16 }}>
                    {/* 2열 그리드로 상품 표시 */}
                    {Array.from({ length: Math.ceil(filteredProducts.length / 2) }).map((_, rowIndex) => {
                      const product1 = filteredProducts[rowIndex * 2];
                      const product2 = filteredProducts[rowIndex * 2 + 1];

                      const navigateToDetail = (product: typeof product1) => {
                        router.push({
                          pathname: '/store-detail',
                          params: {
                            id: product.id,
                            brand: product.brand,
                            name: product.name,
                            price: product.price.toString(),
                            imageType: product.imageType,
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
                    })}
                  </View>
                </View>
              </View>
            </View>
          ) : selectedTab === 'point' ? (
            <View style={{ paddingHorizontal: 20, paddingTop: 18, gap: 30 }}>
              {/* 포인트 카드 */}
              <View
                style={{
                  width: '100%',
                  borderRadius: borderRadius.lg,
                  backgroundColor: colors.primary[50],
                  paddingHorizontal: 22,
                  paddingVertical: 20,
                  gap: 12,
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
                <View style={{ gap: 4 }}>
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.h1Bold,
                      color: colors.coolNeutral[10],
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
              </View>

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
                    {history.length}건
                  </Text>
                </View>

                {/* 히스토리 카드들 */}
                <View style={{ gap: 12 }}>
                  {history.slice(0, visibleHistoryCount).map((item) => (
                    <PointHistoryCard key={item.id} item={item} />
                  ))}
                </View>

                {/* 더보기 */}
                {visibleHistoryCount < history.length && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="more"
                    style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
                    onPress={() => {
                      setVisibleHistoryCount((prev) => Math.min(prev + 4, history.length));
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
              <View
                style={{
                  width: '100%',
                  borderRadius: borderRadius.lg,
                  backgroundColor: colors.primary[50],
                  paddingHorizontal: 22,
                  paddingVertical: 20,
                  gap: 12,
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
                <View style={{ gap: 4 }}>
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.h1Bold,
                      color: colors.coolNeutral[10],
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
              </View>

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
                    {MY_COUPONS.length}개
                  </Text>
                </View>

                {/* 쿠폰 카드들 */}
                <View style={{ gap: 12 }}>
                  {MY_COUPONS.slice(0, visibleCouponCount).map((coupon) => (
                    <CouponCard
                      key={coupon.id}
                      coupon={coupon}
                      onUse={() => handleCouponUse(coupon)}
                    />
                  ))}
                </View>

                {/* 더보기 */}
                {visibleCouponCount < MY_COUPONS.length && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="more-coupons"
                    style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
                    onPress={() => {
                      setVisibleCouponCount((prev) => Math.min(prev + 4, MY_COUPONS.length));
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

