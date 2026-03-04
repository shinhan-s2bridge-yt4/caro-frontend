import { Image, Pressable, Text, View } from 'react-native';
import { borderRadius, colors, typography } from '@/theme';
import type { RewardCoupon } from '@/services/rewardService';
import { formatPointNumber } from '@/utils/points';
import { toRewardImageUrl } from '@/utils/rewardImage';
import PointIcon from '@/assets/icons/point.svg';
import Coffee1Icon from '@/assets/icons/coffee1.svg';

interface StoreProductCardProps {
  product: RewardCoupon;
  onPress?: () => void;
}

export function StoreProductCard({ product, onPress }: StoreProductCardProps) {
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

      <Text
        style={{
          fontFamily: typography.fontFamily.pretendard,
          ...typography.styles.body3Semibold,
          color: colors.coolNeutral[60],
        }}
      >
        {product.brandName}
      </Text>

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
