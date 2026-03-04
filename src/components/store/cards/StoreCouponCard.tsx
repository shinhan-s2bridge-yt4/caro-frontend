import { Pressable, Text, View } from 'react-native';
import { borderRadius, colors, typography } from '@/theme';
import type { MemberCoupon } from '@/services/rewardService';
import { formatDateOnly, getDaysRemaining } from '@/utils/date';
import { formatPointNumber } from '@/utils/points';
import PointIcon from '@/assets/icons/point.svg';

interface StoreCouponCardProps {
  coupon: MemberCoupon;
  onUse?: () => void;
}

export function StoreCouponCard({ coupon, onUse }: StoreCouponCardProps) {
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
