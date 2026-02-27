import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors, typography } from '@/theme';

type ContentStateVariant = 'loading' | 'error' | 'empty';

interface ContentStateProps {
  variant: ContentStateVariant;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export function ContentState({
  variant,
  message,
  actionLabel,
  onAction,
  containerStyle,
}: ContentStateProps) {
  if (variant === 'loading') {
    return (
      <View
        style={[
          { paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
          containerStyle,
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary[50]} />
      </View>
    );
  }

  const textColor = variant === 'error' ? colors.coolNeutral[40] : colors.coolNeutral[60];

  return (
    <View
      style={[
        {
          paddingHorizontal: 20,
          paddingVertical: 40,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        },
        containerStyle,
      ]}
    >
      <Text
        style={{
          fontFamily: typography.fontFamily.pretendard,
          ...typography.styles.body2Medium,
          color: textColor,
          textAlign: 'center',
        }}
      >
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction}>
          <Text
            style={{
              fontFamily: typography.fontFamily.pretendard,
              ...typography.styles.body3Semibold,
              color: colors.primary[50],
            }}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
