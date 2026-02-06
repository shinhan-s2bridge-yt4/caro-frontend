import React, { useRef, useState } from 'react';
import {
  Pressable,
  Text,
  TextInput as RNTextInput,
  TextInputProps,
  View,
} from 'react-native';
import { colors, typography, borderRadius } from '@/theme';
import XIcon from '../../../../assets/icons/x_icon.svg';
import { formatNumberWithComma } from '@/utils/number';

interface CustomNumberInputProps extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  completed?: boolean;
  unitLabel?: string; // ex) "km"
  onClear?: () => void;
}

const TextInput = ({
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
    if (isCompleted) return colors.primary[50];
    if (isFocused) return colors.primary[50]; // 포커스일 때만
    return colors.coolNeutral[20];
  };

  // 배경 색상 결정
  const getBackgroundColor = () => {
    if (disabled) return 'transparent';
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
    const digitsOnly = text.replace(/[^\d]/g, '');
    onChangeText?.(digitsOnly);
  };

  const handleClear = () => {
    onClear?.();
    if (!disabled) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  return (
    <View style={{ width: '100%', maxWidth: 334 }}>
      {/* 라벨 */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
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
          width: '100%',
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
        ) : (
          hasValue &&
          !disabled && (
            <Pressable
              onPressIn={handleClear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <XIcon width={24} height={24} fill={colors.coolNeutral[70]} />
            </Pressable>
          )
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