import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { borderRadius, colors, typography } from '@/theme';
import { CompactCouponUsageGuide } from '@/components/store/CouponGuide';
import type { MemberCoupon, MemberCouponDetail } from '@/services/rewardService';
import { formatDateDotSeparated, formatDateKoreanWithUntil, getDaysRemaining } from '@/utils/date';
import { toRewardImageUrl } from '@/utils/rewardImage';
import XIcon from '@/assets/icons/x_icon.svg';

interface StoreCouponUseModalProps {
  selectedCoupon: MemberCoupon | null;
  couponDetail: MemberCouponDetail | null;
  isBarcodeLarge: boolean;
  isUsageGuideExpanded: boolean;
  onClose: () => void;
  onSetBarcodeLarge: (value: boolean) => void;
  onSetUsageGuideExpanded: (value: boolean) => void;
  BarcodeComponent: any;
}

export function StoreCouponUseModal({
  selectedCoupon,
  couponDetail,
  isBarcodeLarge,
  isUsageGuideExpanded,
  onClose,
  onSetBarcodeLarge,
  onSetUsageGuideExpanded,
  BarcodeComponent,
}: StoreCouponUseModalProps) {
  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          marginBottom: 20,
        }}
      >
        <Pressable
          onPress={onClose}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="close-modal"
        >
          <XIcon width={24} height={24} />
        </Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {selectedCoupon && !isBarcodeLarge ? (
          <View style={{ gap: 16 }}>
            <View
              style={{
                alignItems: 'center',
                gap: 24,
              }}
            >
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

              {couponDetail?.imageUrl ? (
                <Image
                  source={{ uri: toRewardImageUrl(couponDetail.imageUrl) }}
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
                {BarcodeComponent ? (
                  <BarcodeComponent
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
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body2Medium,
                        color: colors.coolNeutral[60],
                        letterSpacing: 4,
                      }}
                    >
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

            <View style={{ gap: 12 }}>
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
                    {formatDateKoreanWithUntil(couponDetail?.expiredAt || selectedCoupon.expiredAt)}
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

              {couponDetail?.exchangedAt ? (
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
                    {formatDateDotSeparated(couponDetail.exchangedAt)}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={{ gap: 24 }}>
              <Pressable
                onPress={() => onSetBarcodeLarge(true)}
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

              <View>
                <CompactCouponUsageGuide
                  expanded={isUsageGuideExpanded}
                  onExpand={() => onSetUsageGuideExpanded(true)}
                  onCollapse={() => onSetUsageGuideExpanded(false)}
                />
              </View>
            </View>
          </View>
        ) : null}

        {selectedCoupon && isBarcodeLarge ? (
          <View style={{ gap: 24 }}>
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
              <View
                style={{
                  transform: [{ rotate: '90deg' }],
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {BarcodeComponent ? (
                  <BarcodeComponent
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
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.h2Semibold,
                        color: colors.coolNeutral[60],
                        letterSpacing: 6,
                      }}
                    >
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

            <Pressable
              onPress={() => onSetBarcodeLarge(false)}
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
        ) : null}
      </ScrollView>
    </>
  );
}
