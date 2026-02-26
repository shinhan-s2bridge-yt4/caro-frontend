import React, { useRef, useState } from 'react';
import {
  Pressable,
  Text,
  TextInput as RNTextInput,
  TextInputProps,
} from 'react-native';
import { colors, typography } from '@/theme';
import XIcon from '@/assets/icons/x_icon.svg';
import { formatNumberWithComma, onlyDigits } from '@/utils/number';
import { BaseInput, InputFrame } from '@/components/common/Input/BaseInput';

interface CustomNumberInputProps extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  completed?: boolean;
  unitLabel?: string; // ex) "km"
  onClear?: () => void;
}

const NumberInput = ({
  label,
  required = false,
  error,
  disabled = false,
  completed = false,
  unitLabel,
  onClear,
  value,
  onChangeText,
  onFocus,
  onBlur,
  ...props
}: CustomNumberInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<RNTextInput>(null);
  
  const hasValue = value && value.length > 0;
  const hasError = error && error.length > 0;
  const isCompleted = completed && hasValue && !hasError;
  const displayValue = isFocused ? (value ?? '') : formatNumberWithComma(value);

  // 테두리 색상 결정
  const getBorderColor = () => {
    if (disabled) return colors.coolNeutral[30];
    if (hasError) return colors.red[30];
    if (isFocused) return colors.primary[50];
    if (hasValue) return colors.coolNeutral[30]; // 값 있고 포커스 아닐 때 → 비활성 스타일
    return colors.coolNeutral[20];
  };

  // 배경 색상 결정
  const getBackgroundColor = () => {
    if (disabled) return 'transparent';
    if (!isFocused && hasValue) return colors.background.default; // 값 있고 포커스 아닐 때 → 비활성 스타일
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

  const handleChangeText = (text: string) => {
    onChangeText?.(onlyDigits(text));
  };

  const handleClear = () => {
    onClear?.();
    if (!disabled) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  return (
    <BaseInput label={label} required={required} error={error}>
      {/* 입력창 */}
      <InputFrame
        width={334}
        borderColor={getBorderColor()}
        backgroundColor={getBackgroundColor()}
        style={{ justifyContent: 'space-between' }}
      >
        <RNTextInput
          ref={inputRef}
          value={displayValue}
          editable={!disabled}
          keyboardType="number-pad"
          inputMode="numeric"
          placeholderTextColor={colors.coolNeutral[30]}
          cursorColor={getCursorColor()}
          selectionColor={getCursorColor()}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            flex: 1,
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.body2Regular,
            color: isCompleted ? colors.primary[50] : colors.coolNeutral[70],
            padding: 0,
          }}
          {...props}
        />

        {/* 오른쪽 표시 */}
        {unitLabel ? (
          <Text
            style={{
              fontFamily: typography.fontFamily.pretendard,
              ...typography.styles.body3Semibold,
              color: isCompleted ? colors.primary[50] : colors.coolNeutral[40],
            }}
          >
            {unitLabel}
          </Text>
        ) : hasValue && !disabled && isFocused ? (
          <Pressable
            onPressIn={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <XIcon width={24} height={24} fill={colors.coolNeutral[70]} />
          </Pressable>
        ) : hasValue && !isFocused ? (
          <Text
            style={{
              fontFamily: typography.fontFamily.pretendard,
              ...typography.styles.body3Regular,
              color: colors.coolNeutral[80],
            }}
          >
            (원)
          </Text>
        ) : null}

      </InputFrame>
    </BaseInput>
  );
};

export default NumberInput;