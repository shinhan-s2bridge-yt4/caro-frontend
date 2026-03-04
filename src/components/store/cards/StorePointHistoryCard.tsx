import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { borderRadius, colors, typography } from '@/theme';
import type { PointHistory } from '@/services/rewardService';
import { formatDateOnly } from '@/utils/date';
import { formatPointDelta } from '@/utils/points';
import CalendarIcon from '@/assets/icons/calendar.svg';
import GcarIcon from '@/assets/icons/gcar.svg';
import RcarIcon from '@/assets/icons/rcar.svg';
import RcalIcon from '@/assets/icons/rcal.svg';
import RcouponIcon from '@/assets/icons/rcoupon.svg';

interface StorePointHistoryCardProps {
  item: PointHistory;
}

export function StorePointHistoryCard({ item }: StorePointHistoryCardProps) {
  const router = useRouter();
  const isEarn = item.pointChange >= 0;
  const amountColor = isEarn ? colors.primary[50] : colors.red[50];

  const displayDate =
    item.type === 'DRIVING' && item.drivingDetail
      ? formatDateOnly(item.drivingDetail.startDateTime)
      : formatDateOnly(item.date);
  const distanceKm = item.type === 'DRIVING' && item.drivingDetail ? item.drivingDetail.distanceKm : null;

  const TypeIcon =
    item.type === 'DRIVING' ? RcarIcon : item.type === 'ATTENDANCE' ? RcalIcon : RcouponIcon;

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
      <TypeIcon width={44} height={44} />

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
