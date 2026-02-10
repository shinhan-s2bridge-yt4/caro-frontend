import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { borderRadius, colors, typography } from '@/theme';
import { NavigationBar } from '@/components/common/Bar/NavigationBar';
import { Toast } from '@/components/common/Toast';
import { useDrivingRecordStore } from '@/stores/drivingRecordStore';
import { useAuthStore } from '@/stores/authStore';
import { exchangeCoupon } from '@/services/rewardService';

import ArrowLeftIcon from '../assets/icons/arrow-left.svg';
import PointIcon from '../assets/icons/point.svg';
import UpIcon from '../assets/icons/UpIcon.svg';
import DownIcon from '../assets/icons/DownIcon.svg';
import Coffee1Icon from '../assets/icons/coffee1.svg';
import OneIcon from '../assets/icons/one.svg';
import TwoIcon from '../assets/icons/two.svg';
import ThreeIcon from '../assets/icons/three.svg';
import FourIcon from '../assets/icons/four.svg';

const IMAGE_BASE_URL = 'https://api.caro.today';

// 아코디언 섹션 컴포넌트
function AccordionSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <View style={{ gap: 20 }}>
      <Pressable
        onPress={() => setIsOpen(!isOpen)}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.coolNeutral[30],
        }}
      >
        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.body2Bold,
            color: colors.coolNeutral[80],
          }}
        >
          {title}
        </Text>
        {isOpen ? (
          <UpIcon width={20} height={20} />
        ) : (
          <DownIcon width={20} height={20} />
        )}
      </Pressable>
      {isOpen && <View>{children}</View>}
    </View>
  );
}

// 쿠폰 사용 방법 아이템
function BulletItem({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      <Text
        style={{
          fontFamily: typography.fontFamily.pretendard,
          ...typography.styles.body3Medium,
          color: colors.coolNeutral[40],
          flex: 1,
        }}
      >
        •  {text}
      </Text>
    </View>
  );
}

// 번호 아이콘 컴포넌트
function NumberIcon({ number }: { number: number }) {
  switch (number) {
    case 1:
      return <OneIcon width={16} height={16} />;
    case 2:
      return <TwoIcon width={16} height={16} />;
    case 3:
      return <ThreeIcon width={16} height={16} />;
    case 4:
      return <FourIcon width={16} height={16} />;
    default:
      return <OneIcon width={16} height={16} />;
  }
}

// 번호 아이템
function NumberedItem({ number, text }: { number: number; text: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      <NumberIcon number={number} />
      <Text
        style={{
          fontFamily: typography.fontFamily.pretendard,
          ...typography.styles.body3Medium,
          color: colors.coolNeutral[40],
          flex: 1,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

export default function StoreDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { accessToken } = useAuthStore();
  const { summary, fetchSummary } = useDrivingRecordStore();

  // URL 파라미터에서 상품 정보 가져오기
  const productId = params.id as string;
  const productBrand = (params.brand as string) || '스타벅스';
  const productName = (params.name as string) || '[스타벅스] 아이스 아메리카노 Tall 모바일 교환권';
  const productPrice = Number(params.price) || 11000;
  const productImageUrl = params.imageUrl as string | undefined;

  // API에서 포인트 정보 가져오기
  useEffect(() => {
    if (accessToken) {
      fetchSummary({ accessToken });
    }
  }, [accessToken, fetchSummary]);

  // 사용자 포인트
  const userPoint = summary?.totalEarnedPoints ?? 0;

  // 포인트 충분 여부
  const hasEnoughPoints = userPoint >= productPrice;

  // 교환 확인 팝업
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isExchanging, setIsExchanging] = useState(false);

  const handleExchange = async () => {
    setIsExchanging(true);
    try {
      await exchangeCoupon(Number(productId));
      setIsExchangeModalOpen(false);
      setIsToastVisible(true);
      // 포인트 갱신
      if (accessToken) {
        fetchSummary({ accessToken });
      }
    } catch (err) {
      setIsExchangeModalOpen(false);
      console.warn('쿠폰 교환 실패:', err);
    } finally {
      setIsExchanging(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.coolNeutral[10] }}>
      {/* 교환 확인 팝업 */}
      {isExchangeModalOpen && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* 배경 터치 */}
          <Pressable
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={() => setIsExchangeModalOpen(false)}
          />

          {/* 팝업 카드 */}
          <View
            style={{
              backgroundColor: colors.coolNeutral[10],
              borderRadius: 20,
              paddingTop: 32,
              paddingBottom: 20,
              paddingHorizontal: 20,
              width: '85%',
              maxWidth: 340,
              alignItems: 'center',
              gap: 20,
            }}
          >
            {/* 포인트 + 제목 + 안내 문구 묶음 */}
            <View style={{ alignItems: 'center', gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <PointIcon width={20} height={20} />
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.body2Bold,
                    color: colors.coolNeutral[90],
                  }}
                >
                  {productPrice.toLocaleString('ko-KR')} P 를
                </Text>
              </View>

              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body2Bold,
                  color: colors.coolNeutral[80],
                }}
              >
                쿠폰으로 교환하시겠어요?
              </Text>

              {/* 안내 문구 */}
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body3Medium,
                  color: colors.coolNeutral[40],
                  textAlign: 'center',
                  lineHeight: 22,
                }}
              >
                {productPrice.toLocaleString('ko-KR')}P가 차감되고 쿠폰이 바로 지급돼요.{'\n'}
                교환 후에는 취소가 불가능해요.
              </Text>
            </View>

            {/* 버튼 영역 */}
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              {/* 취소 버튼 */}
              <Pressable
                onPress={() => setIsExchangeModalOpen(false)}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.coolNeutral[20],
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.body2Semibold,
                    color: colors.coolNeutral[50],
                  }}
                >
                  취소할래요
                </Text>
              </Pressable>

              {/* 교환 버튼 */}
              <Pressable
                onPress={handleExchange}
                disabled={isExchanging}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: borderRadius.md,
                  backgroundColor: isExchanging ? colors.coolNeutral[30] : colors.primary[50],
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.body2Semibold,
                    color: colors.coolNeutral[10],
                  }}
                >
                  {isExchanging ? '교환 중...' : '교환하기'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100, gap: 28 }}>
        {/* 헤더 */}
        <View
          style={{
            paddingTop: 12,
            paddingBottom: 20,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            borderBottomColor: colors.coolNeutral[30],
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

          {/* 포인트 표시 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8 }}>
            <PointIcon width={14} height={14} />
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body1Bold,
                color: colors.coolNeutral[60],
              }}
            >
              {userPoint.toLocaleString('ko-KR')} P
            </Text>
          </View>
        </View>

        {/* 상품 이미지 + 상품 정보 영역 */}
        <View style={{ gap: 28 }}>
          {/* 상품 이미지 */}
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {productImageUrl ? (
              <Image
                source={{ uri: `${IMAGE_BASE_URL}${productImageUrl}` }}
                style={{ width: 257, height: 257 }}
                resizeMode="contain"
              />
            ) : (
              <Coffee1Icon width={257} height={257} />
            )}
          </View>

          {/* 상품 정보 + 버튼 + 아코디언 영역 */}
          <View style={{ paddingHorizontal: 20, gap: 24 }}>
            {/* 상품 정보 */}
            <View style={{ gap: 8, paddingTop: 24, paddingBottom: 20 }}>
              {/* 브랜드명 */}
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body2Medium,
                  color: colors.coolNeutral[50],
                }}
              >
                {productBrand}
              </Text>

              {/* 상품명 */}
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.h2Semibold,
                  color: colors.coolNeutral[90],
                  lineHeight: 26,
                }}
              >
                {productName}
              </Text>

              {/* 가격 */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <PointIcon width={20} height={20} />
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.h1Bold,
                    color: colors.coolNeutral[90],
                  }}
                >
                  {productPrice.toLocaleString('ko-KR')} P
                </Text>
              </View>
            </View>

            {/* 버튼 + 아코디언 영역 */}
            <View style={{ gap: 47 }}>
          {/* 교환 버튼 */}
          <Pressable
            disabled={!hasEnoughPoints}
            style={{
              width: '100%',
              height: 52,
              borderRadius: borderRadius.md,
              backgroundColor: hasEnoughPoints ? colors.primary[50] : colors.coolNeutral[20],
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => setIsExchangeModalOpen(true)}
          >
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body1Bold,
                color: hasEnoughPoints ? colors.background.default : colors.coolNeutral[40],
              }}
            >
              {hasEnoughPoints ? '포인트로 교환하기' : '포인트가 부족해요'}
            </Text>
          </Pressable>

          {/* 아코디언 섹션들 */}
          <View style={{ gap: 24 }}>
          {/* 쿠폰 및 이용 안내 */}
          <AccordionSection title="쿠폰 및 이용 안내" defaultOpen={true}>
            <View style={{ gap: 12 }}>
              <BulletItem text="포인트로 교환하면 모바일 쿠폰으로 바로 지급돼요." />
              <BulletItem text="교환 완료 후에는 취소나 환불이 어려워요." />
              <BulletItem text="쿠폰은 발급일 기준 30일 동안 사용 가능해요." />
              <BulletItem text="일부 매장에서는 사용이 제한될 수 있어요." />
              <BulletItem text="매장 상황에 따라 조기 품절될 수 있어요." />
            </View>
          </AccordionSection>

          {/* 쿠폰 사용 방법 */}
          <AccordionSection title="쿠폰 사용 방법" defaultOpen={true}>
            <View style={{ gap: 12 }}>
              <NumberedItem number={1} text="'교환하기' 버튼을 눌러주세요." />
              <NumberedItem number={2} text="마이페이지 > 내 쿠폰함에서 확인!" />
              <NumberedItem number={3} text="매장에서 직원에게 쿠폰 화면 보여주기" />
              <NumberedItem number={4} text="바코드 스캔 후 바로 사용 완료!" />
            </View>
          </AccordionSection>

          {/* 사용 전 꼭 확인해주세요! */}
          <AccordionSection title="사용 전 꼭 확인해주세요!" defaultOpen={true}>
            <View style={{ gap: 12 }}>
              <BulletItem text="쿠폰은 다른 사람에게 양도할 수 없어요." />
              <BulletItem text="사용하지 않은 쿠폰은 재발급되지 않아요." />
              <BulletItem text="네트워크 문제로 발급이 늦어질 수 있어요." />
              <BulletItem text="현금으로 바꿀 수 없어요." />
              <BulletItem text="운영 정책에 따라 내용이 바뀔 수 있어요." />
            </View>
          </AccordionSection>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Toast
        message="교환 완료! 쿠폰이 저장됐어요."
        visible={isToastVisible}
        actionLabel="보러가기"
        onAction={() => {
          setIsToastVisible(false);
          router.push({ pathname: '/store', params: { tab: 'coupon' } });
        }}
        onDismiss={() => setIsToastVisible(false)}
      />

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
