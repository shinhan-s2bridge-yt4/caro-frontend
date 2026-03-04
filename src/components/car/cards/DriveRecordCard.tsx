import { Pressable, Text, View } from 'react-native';
import { borderRadius, colors, typography } from '@/theme';
import type { DrivingRecord } from '@/types/drivingRecord';
import { formatDateWithDay, formatTimeHHMM } from '@/utils/date';
import { formatCarModel, formatDistanceLabel, formatEarnedPointsLabel } from '@/utils/driving';
import GCarIcon from '@/assets/icons/gcar.svg';
import PointIcon from '@/assets/icons/point.svg';

const TAG_MIN_WIDTH = 44;

function Tag({ label }: { label: '출발' | '도착' }) {
  return (
    <View
      style={{
        height: 24,
        minWidth: TAG_MIN_WIDTH,
        paddingHorizontal: 8,
        borderRadius: 999,
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
        {label}
      </Text>
    </View>
  );
}

export function DriveRecordCard({ item, onPress }: { item: DrivingRecord; onPress?: () => void }) {
  const dateLabel = formatDateWithDay(item.startDateTime);
  const earnedLabel = formatEarnedPointsLabel(item.earnedPoints);
  const startTime = formatTimeHHMM(item.startDateTime);
  const endTime = formatTimeHHMM(item.endDateTime);
  const distanceLabel = formatDistanceLabel(item.distanceKm);
  const carModel = formatCarModel(item.vehicleBrandName, item.vehicleModelName, item.vehicleVariantName);

  return (
    <Pressable
      onPress={onPress}
      style={{
        width: '100%',
        backgroundColor: colors.coolNeutral[10],
        borderRadius: borderRadius.lg,
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 8,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.body1Semibold,
            color: colors.coolNeutral[80],
          }}
        >
          {dateLabel}
        </Text>
        {item.earnedPoints > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.h3Semibold,
                color: colors.primary[50],
              }}
            >
              {earnedLabel}
            </Text>
            <PointIcon width={14} height={14} />
          </View>
        ) : null}
      </View>

      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
          <Tag label="출발" />
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body2Medium,
                color: colors.coolNeutral[60],
              }}
            >
              {startTime}
            </Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                flex: 1,
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body2Medium,
                color: colors.coolNeutral[40],
              }}
            >
              {item.startLocation}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
          <Tag label="도착" />
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body2Medium,
                color: colors.coolNeutral[60],
              }}
            >
              {endTime}
            </Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                flex: 1,
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body2Medium,
                color: colors.coolNeutral[40],
              }}
            >
              {item.endLocation}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
        <View style={{ width: TAG_MIN_WIDTH, height: 24 }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text
            style={{
              fontFamily: typography.fontFamily.pretendard,
              ...typography.styles.body3Semibold,
              color: colors.coolNeutral[40],
            }}
          >
            {distanceLabel}
          </Text>
          <Text
            style={{
              fontFamily: typography.fontFamily.pretendard,
              ...typography.styles.body3Semibold,
              color: colors.coolNeutral[40],
            }}
          >
            |
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <GCarIcon width={16} height={16} />
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body3Semibold,
                color: colors.coolNeutral[40],
              }}
            >
              {carModel}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
