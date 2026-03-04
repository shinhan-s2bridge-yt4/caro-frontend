import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { borderRadius, colors, typography } from '@/theme';
import { MainButton } from '@/components/common/Button/MainButton';
import { OverlayModal } from '@/components/common/Modal/OverlayModal';
import { StoreDetailCouponGuide } from '@/components/store/CouponGuide';
import { Toast } from '@/components/common/Toast';
import { exchangeCoupon, type RewardCoupon } from '@/services/rewardService';
import { formatPointNumber, formatPointTotal } from '@/utils/points';
import { toRewardImageUrl } from '@/utils/rewardImage';

import ArrowLeftIcon from '@/assets/icons/arrow-left.svg';
import PointIcon from '@/assets/icons/point.svg';
import Coffee1Icon from '@/assets/icons/coffee1.svg';

interface StoreDetailSectionProps {
  product: RewardCoupon;
  userPoint: number;
  onReloadPoints: () => Promise<unknown>;
  onBack: () => void;
  onExchanged?: () => void;
}

export function StoreDetailSection({
  product,
  userPoint,
  onReloadPoints,
  onBack,
  onExchanged,
}: StoreDetailSectionProps) {
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isExchanging, setIsExchanging] = useState(false);

  const hasEnoughPoints = userPoint >= product.requiredPoints;

  const handleExchange = async () => {
    setIsExchanging(true);
    try {
      await exchangeCoupon(product.id);
      setIsExchangeModalOpen(false);
      setIsToastVisible(true);
      await onReloadPoints();
      onExchanged?.();
    } catch (err: any) {
      setIsExchangeModalOpen(false);
      console.warn('쿠폰 교환 실패:', err);
      console.warn('응답 데이터:', err?.response?.data);
      console.warn('요청 데이터:', err?.config?.data);
    } finally {
      setIsExchanging(false);
    }
  };

  return (
    <>
      <OverlayModal
        visible={isExchangeModalOpen}
        onBackdropPress={() => setIsExchangeModalOpen(false)}
        contentStyle={{
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
              {formatPointTotal(product.requiredPoints)}를
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

          <Text
            style={{
              fontFamily: typography.fontFamily.pretendard,
              ...typography.styles.body3Medium,
              color: colors.coolNeutral[40],
              textAlign: 'center',
              lineHeight: 22,
            }}
          >
            {formatPointNumber(product.requiredPoints)}P가 차감되고 쿠폰이 바로 지급돼요.{'\n'}
            교환 후에는 취소가 불가능해요.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
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
      </OverlayModal>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100, gap: 28 }}>
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
            onPress={onBack}
            style={{ width: 24, height: 24, justifyContent: 'center' }}
            accessibilityRole="button"
            accessibilityLabel="back"
          >
            <ArrowLeftIcon width={24} height={24} />
          </Pressable>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8 }}>
            <PointIcon width={14} height={14} />
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body1Bold,
                color: colors.coolNeutral[60],
              }}
            >
              {formatPointTotal(userPoint)}
            </Text>
          </View>
        </View>

        <View style={{ gap: 28 }}>
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {product.imageUrl ? (
              <Image
                source={{ uri: toRewardImageUrl(product.imageUrl) }}
                style={{ width: 257, height: 257 }}
                resizeMode="contain"
              />
            ) : (
              <Coffee1Icon width={257} height={257} />
            )}
          </View>

          <View style={{ paddingHorizontal: 20, gap: 24 }}>
            <View style={{ gap: 8, paddingTop: 24, paddingBottom: 20 }}>
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body2Medium,
                  color: colors.coolNeutral[50],
                }}
              >
                {product.brandName}
              </Text>

              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.h2Semibold,
                  color: colors.coolNeutral[90],
                  lineHeight: 26,
                }}
              >
                {product.itemName}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <PointIcon width={20} height={20} />
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.h1Bold,
                    color: colors.coolNeutral[90],
                  }}
                >
                  {formatPointTotal(product.requiredPoints)}
                </Text>
              </View>
            </View>

            <View style={{ gap: 47 }}>
              <MainButton
                label={hasEnoughPoints ? '포인트로 교환하기' : '포인트가 부족해요'}
                disabled={!hasEnoughPoints}
                alwaysPrimary={hasEnoughPoints}
                onPress={() => setIsExchangeModalOpen(true)}
                containerStyle={{
                  width: '100%',
                  height: 52,
                  backgroundColor: hasEnoughPoints ? colors.primary[50] : colors.coolNeutral[20],
                }}
                labelStyle={{
                  ...typography.styles.body1Bold,
                  color: hasEnoughPoints ? colors.background.default : colors.coolNeutral[40],
                }}
              />

              <StoreDetailCouponGuide />
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
          onBack();
        }}
        onDismiss={() => setIsToastVisible(false)}
      />
    </>
  );
}
