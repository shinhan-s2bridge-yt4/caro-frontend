import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Text, View } from 'react-native';
import { borderRadius, colors, typography } from '@/theme';

type LabelTone = 'body2' | 'body3';

interface BaseInputProps {
  label: string;
  required?: boolean;
  error?: string;
  success?: string;
  width?: number;
  labelTone?: LabelTone;
  children: ReactNode;
}

interface InputFrameProps {
  children: ReactNode;
  width: number;
  borderColor: string;
  backgroundColor: string;
  style?: StyleProp<ViewStyle>;
}

function getLabelTextStyle(tone: LabelTone): TextStyle {
  return tone === 'body3' ? typography.styles.body3Semibold : typography.styles.body2Semibold;
}

export function BaseInput({
  label,
  required = false,
  error,
  success,
  width = 334,
  labelTone = 'body2',
  children,
}: BaseInputProps) {
  const hasError = !!error && error.length > 0;
  const hasSuccess = !!success && success.length > 0;

  return (
    <View style={{ width }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...getLabelTextStyle(labelTone),
            color: colors.coolNeutral[80],
          }}
        >
          {label}
        </Text>
        {required && (
          <Text
            style={{
              fontFamily: typography.fontFamily.pretendard,
              ...typography.styles.captionMedium,
              color: colors.primary[50],
            }}
          >
            *필수
          </Text>
        )}
      </View>

      {children}

      {hasError && (
        <Text
          style={{
            marginTop: 4,
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.captionRegular,
            color: colors.red[30],
          }}
        >
          {error}
        </Text>
      )}

      {hasSuccess && (
        <Text
          style={{
            marginTop: 4,
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.captionRegular,
            color: colors.primary[50],
          }}
        >
          {success}
        </Text>
      )}
    </View>
  );
}

export function InputFrame({
  children,
  width,
  borderColor,
  backgroundColor,
  style,
}: InputFrameProps) {
  return (
    <View
      style={[
        {
          width,
          height: 48,
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: 12,
          paddingRight: 20,
          paddingVertical: 8,
          borderRadius: borderRadius.md,
          borderWidth: 1.2,
          borderColor,
          backgroundColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
