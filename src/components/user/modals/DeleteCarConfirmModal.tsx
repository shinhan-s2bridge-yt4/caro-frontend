import { Modal, Pressable, Text, View } from 'react-native';
import { borderRadius, colors, typography } from '@/theme';

interface DeleteCarConfirmModalProps {
  visible: boolean;
  carName?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteCarConfirmModal({
  visible,
  carName,
  onCancel,
  onConfirm,
}: DeleteCarConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.32)', justifyContent: 'center', alignItems: 'center' }}>
        <Pressable
          onPress={onCancel}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
        />
        <View
          style={{
            width: 296,
            backgroundColor: colors.coolNeutral[10],
            borderRadius: 20,
            paddingTop: 32,
            paddingBottom: 24,
            paddingHorizontal: 24,
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View style={{ alignItems: 'center', gap: 12 }}>
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body2Semibold,
                color: colors.coolNeutral[80],
                textAlign: 'center',
              }}
            >
              카로에 등록 된{'\n'}
              <Text style={{ color: colors.primary[50] }}>{carName}</Text>
              을 삭제할까요?
            </Text>

            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body2Medium,
                color: colors.coolNeutral[40],
                textAlign: 'center',
              }}
            >
              삭제하면 차량 정보가{'\n'}카로에서 사라져요.
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
            <Pressable
              onPress={onCancel}
              style={{
                flex: 1,
                height: 36,
                borderRadius: borderRadius.md,
                backgroundColor: colors.coolNeutral[20],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body3Medium,
                  color: colors.coolNeutral[40],
                }}
              >
                취소할래요
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={{
                flex: 1,
                height: 36,
                borderRadius: borderRadius.md,
                backgroundColor: colors.primary[50],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body3Semibold,
                  color: colors.coolNeutral[10],
                }}
              >
                삭제하기
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
