import React, { useRef, useState } from 'react';
import { TextInput as RNTextInput, Pressable, Text, TextInputProps, View } from 'react-native';
import { colors, typography } from '@/theme';
import XIcon from '@/assets/icons/x_icon.svg';
import EyeOpenIcon from '@/assets/icons/eye-open.svg';
import EyeClosedIcon from '@/assets/icons/eye-closed.svg';
import { BaseInput, InputFrame } from '@/components/common/Input/BaseInput';


interface CustomPasswordInputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  label: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  onClear?: () => void;
}

const PasswordInput = ({
  label,
  required = false,
  error,
  disabled = false,
  onClear,
  value,
  onFocus,
  onBlur,
  ...props
}: CustomPasswordInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<RNTextInput>(null);
  // "일회성 보기": 누르는 동안만 잠깐 보여주기
  const [isPasswordRevealed, setIsPasswordRevealed] = useState(false);
  
  const hasValue = value && value.length > 0;
  const hasError = error && error.length > 0;

  // 테두리 색상 결정
  const getBorderColor = () => {
    if (disabled) return colors.coolNeutral[30];
    if (hasError) return colors.red[30];
    // 비밀번호 입력은 "포커스일 때만" 강조 보더가 보이도록
    if (isFocused) return colors.primary[50];
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
          // 외부에서 secureTextEntry를 넘기더라도, 내부 토글이 최우선이 되도록 마지막에 선언
          secureTextEntry={!isPasswordRevealed}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>

          {/* X 버튼 - 포커스 상태이고 값이 있을 때만 표시 */}
          {hasValue && !disabled && isFocused && (
            <Pressable
              onPressIn={handleClear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <XIcon width={24} height={24} fill={colors.coolNeutral[70]} />
            </Pressable>
          )}
          {/* 비밀번호 보기/숨기기 - 포커스 상태이고 값 있을 때만 */}
          {!!hasValue && !disabled && isFocused && (
            <Pressable
              onPressIn={() => setIsPasswordRevealed(true)}
              onPressOut={() => setIsPasswordRevealed(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {isPasswordRevealed ? (
                <EyeOpenIcon width={24} height={24} />
              ) : (
                <EyeClosedIcon width={24} height={24} />
              )}
            </Pressable>
          )}
        </View>
      </InputFrame>
    </BaseInput>
  );
};

export default PasswordInput;