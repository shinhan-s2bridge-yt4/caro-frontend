import React, { useRef, useState } from 'react';
import {
  Keyboard,
  Pressable,
  Text,
  TextInput as RNTextInput,
  TextInputProps,
  View,
} from 'react-native';
import { colors, typography, borderRadius } from '@/theme';
import XIcon from '@/assets/icons/x_icon.svg';
import { BaseInput, InputFrame } from '@/components/common/Input/BaseInput';

interface CustomCarTypeInputProps extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
  success?: string;
  completed?: boolean;
  onClear?: () => void;
  onCheckDuplicate?: () => void;
}

const CarTypeInput = ({
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
}: CustomCarTypeInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<RNTextInput>(null);
  
  const hasValue = value && value.length > 0;
  const hasError = error && error.length > 0;
  const hasSuccess = success && success.length > 0;

  // 테두리 색상 결정
  const getBorderColor = () => {
    if (completed || hasSuccess) return colors.coolNeutral[10];
    if (hasError) return colors.red[30];
    if (isFocused) return colors.primary[50]; // 포커스일 때만
    return colors.coolNeutral[20];
  };

  // 배경 색상 결정
  const getBackgroundColor = () => {
    if (completed) return 'transparent';
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

  const handlePressSearch = () => {
    setIsFocused(false);
    inputRef.current?.blur();
    Keyboard.dismiss();
    onCheckDuplicate?.();
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
    width={260}
    borderColor={getBorderColor()}
    backgroundColor={getBackgroundColor()}
  >
    <RNTextInput
      ref={inputRef}
      value={value}
      editable={!completed}
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
        {/* X 버튼 - 포커스 중이거나 값이 있을 때만 표시 */}
        {isFocused && (hasValue || hasError) && !completed &&(
          <Pressable
            onPress={onClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <XIcon width={24} height={24} fill={colors.coolNeutral[70]} />
          </Pressable>
        )}
  </InputFrame>

  {/* 🔹 중복확인 버튼 */}
  <Pressable
    onPress={handlePressSearch}
    disabled={completed || !value}
    style={({ pressed }) => ({
      width: 63,
      height: 48,
      paddingHorizontal: 12,
      paddingVertical: 4,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.md,
      backgroundColor: colors.primary[50],
    })}
  >
    <Text
      style={{
        fontFamily: typography.fontFamily.pretendard,
        ...typography.styles.body3Semibold,
        color: colors.coolNeutral[10],
      }}
    >
      검색
    </Text>
  </Pressable>
</View>
    </BaseInput>
  );
};

export default CarTypeInput;