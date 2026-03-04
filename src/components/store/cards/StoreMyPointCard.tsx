import { Pressable, Text, View } from 'react-native';
import { borderRadius, colors, typography } from '@/theme';
import { formatPointNumber, formatPointTotal } from '@/utils/points';
import PointIcon from '@/assets/icons/point.svg';
import WDownIcon from '@/assets/icons/wdown.svg';
import WupIcon from '@/assets/icons/wup.svg';

export interface StorePointBreakdown {
  attendance: number;
  driving: number;
  used: number;
}

interface StoreMyPointCardProps {
  pointTotal: number;
  isExpanded: boolean;
  onToggle: () => void;
  breakdown: StorePointBreakdown;
}

export function StoreMyPointCard({
  pointTotal,
  isExpanded,
  onToggle,
  breakdown,
}: StoreMyPointCardProps) {
  return (
    <View
      style={{
        width: '100%',
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
      }}
    >
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
          {isExpanded ? <WupIcon width={22} height={22} /> : <WDownIcon width={22} height={22} />}
        </View>
        {!isExpanded ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <PointIcon width={28} height={28} />
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.h1Bold,
                color: colors.coolNeutral[10],
              }}
            >
              {formatPointNumber(pointTotal)}
            </Text>
          </View>
        ) : null}
      </Pressable>

      {isExpanded ? (
        <View
          style={{
            backgroundColor: colors.coolNeutral[10],
            paddingHorizontal: 20,
            paddingBottom: 20,
            paddingTop: 24,
            gap: 24,
          }}
        >
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: typography.fontFamily.pretendard, ...typography.styles.body3Medium, color: colors.coolNeutral[70] }}>
                출석체크 포인트
              </Text>
              <Text style={{ fontFamily: typography.fontFamily.pretendard, ...typography.styles.body3Bold, color: colors.coolNeutral[80] }}>
                {formatPointNumber(breakdown.attendance)}P
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: typography.fontFamily.pretendard, ...typography.styles.body3Medium, color: colors.coolNeutral[70] }}>
                운행기록 포인트
              </Text>
              <Text style={{ fontFamily: typography.fontFamily.pretendard, ...typography.styles.body3Bold, color: colors.coolNeutral[80] }}>
                {formatPointNumber(breakdown.driving)}P
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: typography.fontFamily.pretendard, ...typography.styles.body3Medium, color: colors.red[40] }}>
                나의 차감 포인트
              </Text>
              <Text style={{ fontFamily: typography.fontFamily.pretendard, ...typography.styles.body3Bold, color: colors.red[40] }}>
                -{formatPointNumber(breakdown.used)}P
              </Text>
            </View>
          </View>

          <View style={{ height: 2, backgroundColor: colors.coolNeutral[80] }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: typography.fontFamily.pretendard, ...typography.styles.body2Bold, color: colors.coolNeutral[90] }}>
              현재 포인트
            </Text>
            <Text style={{ fontFamily: typography.fontFamily.pretendard, ...typography.styles.h1Bold, color: colors.primary[50] }}>
              {formatPointTotal(pointTotal)}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}
