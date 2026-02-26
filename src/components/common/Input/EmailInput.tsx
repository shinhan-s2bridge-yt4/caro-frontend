import React, { useRef, useState } from 'react';
import { TextInput as RNTextInput, Pressable, Text, TextInputProps, View } from 'react-native';
import { colors, typography, borderRadius } from '@/theme';
import XIcon from '@/assets/icons/x_icon.svg';
import { BaseInput, InputFrame } from '@/components/common/Input/BaseInput';

interface CustomEmailInputProps extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
  success?: string;
  completed?: boolean;
  onClear?: () => void;
  onCheckDuplicate?: () => void;
}

const EmailInput = ({
  label,
  required = false,
  error,
  success,
  completed = false,
  onClear,
  onCheckDuplicate,
  value,
  onFocus,
  onBlur,
  ...props
}: CustomEmailInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<RNTextInput>(null);

  const hasValue = !!value && value.length > 0;
  const hasError = !!error && error.length > 0;
  const hasSuccess = !!success && success.length > 0;

  // 테두리 색상 결정
  const getBorderColor = () => {
    if (hasError) return colors.red[30];
    if (isFocused) return colors.primary[50];
    if (hasSuccess || hasValue) return colors.coolNeutral[30]; // 값이 있거나 중복확인 완료 → disabled 스타일
    return colors.coolNeutral[20];
  };

  // 배경 색상 결정
  const getBackgroundColor = () => {
    if (!isFocused && (hasSuccess || hasValue)) return colors.background.default; // 포커스 아닐 때 값 있으면 → disabled 스타일
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
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <BaseInput
      label={label}
      required={required}
      error={error}
      success={success}
      labelTone="body3"
    >

{/* 입력 영역 전체 */}
<View
  style={{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 334,
  }}
>
  {/* 🔹 입력칸 */}
  <InputFrame
    width={248}
    borderColor={getBorderColor()}
    backgroundColor={getBackgroundColor()}
  >
    <RNTextInput
      ref={inputRef}
      value={value}
      editable={true}
      placeholderTextColor={colors.coolNeutral[30]}
      cursorColor={getCursorColor()}
      selectionColor={getCursorColor()}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={{
        flex: 1,
        fontFamily: typography.fontFamily.pretendard,
        ...typography.styles.body3Regular,
        color: colors.coolNeutral[70],
        padding: 0,
      }}
      {...props}
    />
    {/* X 버튼 - 포커스 상태이고 값이 있을 때만 표시 */}
        {hasValue && isFocused && !success && (
          <Pressable
            onPressIn={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <XIcon width={24} height={24} fill={colors.coolNeutral[70]} />
          </Pressable>
        )}
  </InputFrame>

  {/* 🔹 중복확인 버튼 */}
  <Pressable
    onPress={onCheckDuplicate}
    disabled={completed || !value || hasSuccess}
    style={({ pressed }) => ({
      width: 82,
      height: 48,
      paddingHorizontal: 12,
      paddingVertical: 4,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.md,
      backgroundColor: success
        ? colors.background.default
        : colors.primary[50],
    })}
  >
    <Text
      style={{
        fontFamily: typography.fontFamily.pretendard,
        ...typography.styles.body3Semibold,
        color: success
          ? colors.coolNeutral[30]
          : colors.coolNeutral[10],
      }}
    >
      {success ? '확인완료' : '중복확인'}
    </Text>
  </Pressable>
</View>
    </BaseInput>
  );
};

export default EmailInput;