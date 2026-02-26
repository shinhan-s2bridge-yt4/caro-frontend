import type { ComponentType, ReactNode } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { Pressable, Text, View } from 'react-native';
import { borderRadius, colors, typography } from '@/theme';

interface SocialLoginButtonBaseProps {
  label: string;
  backgroundColor: string;
  textColor?: string;
  icon: ComponentType<{ width?: number; height?: number }>;
  iconWidth?: number;
  iconHeight?: number;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  rightSlot?: ReactNode;
}

export const SocialLoginButtonBase = ({
  label,
  backgroundColor,
  textColor = colors.coolNeutral[60],
  icon: Icon,
  iconWidth = 24,
  iconHeight = 24,
  onPress,
  disabled = false,
  rightSlot,
}: SocialLoginButtonBaseProps) => {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={{
        width: 335,
        height: 48,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
        <Icon width={iconWidth} height={iconHeight} />
        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.body2Semibold,
            color: textColor,
          }}
        >
          {label}
        </Text>
        {rightSlot}
      </View>
    </Pressable>
  );
};
