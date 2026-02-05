import React, { useState } from 'react';
import { TextInput as RNTextInput, Pressable, Text, TextInputProps, View } from 'react-native';
import { colors, typography, borderRadius } from '@/theme';
import XIcon from '../../../../assets/icons/x_icon.svg';

interface CustomEmailInputProps extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
  success?: string;
  completed?: boolean;
  onClear?: () => void;
  onCheckDuplicate?: () => void;
}

const TextInput = ({
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
  
  const hasValue = !!value && value.length > 0;
  const hasError = !!error && error.length > 0;
  const hasSuccess = !!success && success.length > 0;

  // 테두리 색상 결정
  const getBorderColor = () => {
    if (completed || hasSuccess) return colors.coolNeutral[30];
    if (hasError) return colors.red[30];
    if (isFocused || hasValue) return colors.primary[50]; // 포커스 또는 값 있을 때
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

  return (
    <View style={{ }}>
      {/* 라벨 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: 334, marginBottom: 12}}>
        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.body3Semibold,
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
  <View
    style={{
      width: 248,
      height: 48,
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 12,
      paddingRight: 20,
      paddingVertical: 8,
      borderRadius: borderRadius.md,
      borderWidth: 1.2,
      borderColor: getBorderColor(),
      backgroundColor: getBackgroundColor(),
    }}
  >
    <RNTextInput
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
        {(isFocused || hasValue || hasError) && !success &&(
          <Pressable
            onPress={onClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <XIcon width={24} height={24} fill={colors.coolNeutral[70]} />
          </Pressable>
        )}
  </View>

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
        ? colors.coolNeutral[10]
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

      {/* 성공 메시지 */}
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
};

export default TextInput;