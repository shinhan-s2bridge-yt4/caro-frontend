import React, { useRef, useState } from 'react';
import { TextInput as RNTextInput, Pressable, Text, TextInputProps, View } from 'react-native';
import { colors, typography, borderRadius } from '@/theme';
import XIcon from '../../../../assets/icons/x_icon.svg';

interface CustomTextInputProps extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  onClear?: () => void;
  noBlurStyle?: boolean;
}

const TextInput = ({
  label,
  required = false,
  error,
  disabled = false,
  onClear,
  noBlurStyle = false,
  value,
  onFocus,
  onBlur,
  ...props
}: CustomTextInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<RNTextInput>(null);
  
  const hasValue = value && value.length > 0;
  const hasError = error && error.length > 0;

  // 테두리 색상 결정
  const getBorderColor = () => {
    if (disabled) return colors.coolNeutral[30];
    if (hasError) return colors.red[30];
    if (isFocused) return colors.primary[50];
    if (!noBlurStyle && hasValue) return colors.coolNeutral[30]; // 값이 있고 포커스 아닐 때 → disabled 스타일
    return colors.coolNeutral[20];
  };

  // 배경 색상 결정
  const getBackgroundColor = () => {
    if (disabled) return colors.background.default;
    if (!noBlurStyle && !isFocused && hasValue) return colors.background.default; // 값이 있고 포커스 아닐 때 → disabled 스타일
    return colors.coolNeutral[10];
  };

  // 커서 색상
  const getCursorColor = () => {
    if (hasError) return colors.red[50];
    return colors.primary[50];
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleClear = () => {
    onClear?.();
    if (!disabled) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  return (
    <View style={{ width: 334 }}>
      {/* 라벨 */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: 334,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.body2Semibold,
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

      {/* 입력창 */}
      <View
        style={{
          width: 334,
          height: 48,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 12,
          paddingRight: 20,
          paddingVertical: 8,
          borderRadius: borderRadius.md, // 더 둥글게
          borderWidth: 1.2,
          borderColor: getBorderColor(),
          backgroundColor: getBackgroundColor(),
        }}
      >
        <RNTextInput
          ref={inputRef}
          value={value}
          editable={!disabled}
          placeholderTextColor={colors.coolNeutral[30]}
          cursorColor={getCursorColor()}
          selectionColor={getCursorColor()}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            flex: 1,
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.body2Regular,
            color: colors.coolNeutral[70],
            padding: 0,
          }}
          {...props}
        />

        {/* X 버튼 - 포커스 상태이고 값이 있으면 표시 */}
        {hasValue && !disabled && isFocused && (
          <Pressable
            onPressIn={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <XIcon width={24} height={24} fill={colors.coolNeutral[70]} />
          </Pressable>
        )}
      </View>

      {/* 에러 메시지 */}
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
    </View>
  );
};

export default TextInput;