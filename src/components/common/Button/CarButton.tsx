import { Pressable, Text } from 'react-native';
import { useState } from 'react';
import { typography, colors, borderRadius } from '@/theme';

interface CarButtonProps {
  label: string;
  isSelected?: boolean;
  onPress?: () => void;
}

export const CarButton = ({
  label,
  isSelected: controlledIsSelected,
  onPress,
}: CarButtonProps) => {
  // 내부 상태 추가
  const [internalIsSelected, setInternalIsSelected] = useState(false);
  
  // controlled vs uncontrolled
  const isSelected = controlledIsSelected ?? internalIsSelected;

  const handlePress = () => {
    // 외부에서 제어하지 않는 경우 내부 상태 토글
    if (controlledIsSelected === undefined) {
      setInternalIsSelected(!internalIsSelected);
    }
    // 외부 콜백 실행
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{
        width: 156,
        height: 49,
        borderRadius: borderRadius.md,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isSelected 
          ? colors.primary[50]
          : colors.background.default,
      }}
    >
      <Text
        style={{
          fontFamily: typography.fontFamily.pretendard,
          ...typography.styles.body2Bold,
          color: isSelected 
            ? colors.coolNeutral[10]
            : colors.coolNeutral[40],
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
};