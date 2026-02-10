import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Pressable, Text } from 'react-native';
import { typography, colors, borderRadius } from '@/theme';

interface MainButtonProps {
  label: string;
  disabled?: boolean;
  alwaysPrimary?: boolean;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export const MainButton = ({
  label,
  disabled = false,
  alwaysPrimary = false,
  onPress,
  containerStyle,
  labelStyle,
}: MainButtonProps) => {
  const backgroundColor = alwaysPrimary
    ? colors.primary[50]
    : disabled
      ? colors.background.default
      : colors.background.default;

  const textColor = alwaysPrimary
    ? colors.coolNeutral[10]
    : disabled
      ? colors.coolNeutral[40]
      : colors.coolNeutral[40];

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        {
          width: 335,
          height: 48,
          borderRadius: borderRadius.md, // 12px
          paddingVertical: 12,
          paddingHorizontal: 28,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor,
        },
        containerStyle,
      ]}
    >
      <Text
        style={[
          {
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.h3Bold,
            color: textColor,
          },
          labelStyle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};