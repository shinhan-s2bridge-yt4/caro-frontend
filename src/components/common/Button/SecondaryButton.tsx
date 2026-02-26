import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Pressable, Text } from 'react-native';
import { borderRadius, colors, typography } from '@/theme';

interface SecondaryButtonProps {
  label: string;
  disabled?: boolean;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export const SecondaryButton = ({
  label,
  disabled = false,
  onPress,
  containerStyle,
  labelStyle,
}: SecondaryButtonProps) => {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        {
          width: 335,
          height: 48,
          borderRadius: borderRadius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: disabled ? colors.coolNeutral[30] : colors.coolNeutral[20],
        },
        containerStyle,
      ]}
    >
      <Text
        style={[
          {
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.body2Bold,
            color: colors.coolNeutral[50],
          },
          labelStyle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};
