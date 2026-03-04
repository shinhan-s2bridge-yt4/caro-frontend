import { Image, Modal, Pressable, Text, View } from 'react-native';
import { colors, typography } from '@/theme';
import XIcon from '@/assets/icons/x_icon.svg';

interface HomeAttendanceRewardModalProps {
  visible: boolean;
  attendancePoints: number;
  attendanceStreak: number;
  onClose: () => void;
}

export function HomeAttendanceRewardModal({
  visible,
  attendancePoints,
  attendanceStreak,
  onClose,
}: HomeAttendanceRewardModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 32,
        }}
      >
        <View
          style={{
            width: '100%',
            backgroundColor: colors.coolNeutral[10],
            borderRadius: 20,
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 24,
            alignItems: 'center',
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="close-attendance-modal"
            onPress={onClose}
            style={{ alignSelf: 'flex-end' }}
          >
            <XIcon width={24} height={24} />
          </Pressable>

          <Image
            source={require('@/assets/icons/coin.gif')}
            style={{ width: 146, height: 146 }}
          />

          <View style={{ alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.h2Bold,
                color: colors.coolNeutral[80],
                textAlign: 'center',
              }}
            >
              출석체크 보상{'\n'}{attendancePoints}P 당첨!
            </Text>
          </View>

          <View
            style={{
              width: '100%',
              backgroundColor: colors.background.default,
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 20,
              alignItems: 'center',
              gap: 4,
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body3Semibold,
                color: colors.primary[50],
              }}
            >
              {attendanceStreak}일 연속 출석중!
            </Text>
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body3Regular,
                color: colors.coolNeutral[40],
              }}
            >
              너무 잘하고 있어요. 내일 또 만나요
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="attendance-complete"
            onPress={onClose}
            style={{
              width: '100%',
              backgroundColor: colors.primary[50],
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body1Bold,
                color: colors.coolNeutral[10],
              }}
            >
              확인
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
