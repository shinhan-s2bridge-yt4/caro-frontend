import { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, typography, borderRadius } from '@/theme';
import SmileIcon from '@/assets/icons/smile.svg';

interface ToastProps {
  /** 토스트에 표시할 메시지 */
  message: string;
  /** 토스트 표시 여부 */
  visible: boolean;
  /** 액션 버튼 라벨 (옵션) */
  actionLabel?: string;
  /** 액션 버튼 클릭 핸들러 */
  onAction?: () => void;
  /** 토스트가 닫힐 때 호출되는 콜백 */
  onDismiss?: () => void;
  /** 자동으로 사라지기까지의 시간 (ms). 0이면 자동으로 사라지지 않음 */
  duration?: number;
  /** 컨테이너 스타일 */
  containerStyle?: StyleProp<ViewStyle>;
}

export const Toast = ({
  message,
  visible,
  actionLabel,
  onAction,
  onDismiss,
  duration = 5000,
  containerStyle,
}: ToastProps) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      if (duration > 0) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      hideToast();
    }
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  const handleAction = () => {
    onAction?.();
    hideToast();
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: 112,
          left: 20,
          right: 20,
          height: 52,
          paddingVertical: 10,
          paddingHorizontal: 16,
          backgroundColor: colors.primary[70],
          borderRadius: borderRadius.md,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
          elevation: 8,
          transform: [{ translateY }],
          opacity,
        },
        containerStyle,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          flex: 1,
        }}
      >
        <SmileIcon width={20} height={20} />
        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.body2Medium,
            color: colors.coolNeutral[10],
            flex: 1,
          }}
        >
          {message}
        </Text>
      </View>
      {actionLabel && (
        <Pressable
          style={{
            backgroundColor: colors.primary[80],
            padding: 8,
            borderRadius: 9.3,
          }}
          onPress={handleAction}
        >
          <Text
            style={{
              fontFamily: typography.fontFamily.pretendard,
              ...typography.styles.captionSemibold,
              color: colors.coolNeutral[10],
            }}
          >
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
};
