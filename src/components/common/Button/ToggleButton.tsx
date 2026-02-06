import type { ComponentType } from 'react';
import { useMemo, useState } from 'react';
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import { Pressable, Text, View } from 'react-native';
import { borderRadius, colors, typography } from '@/theme';

type SvgIcon = ComponentType<{ width?: number; height?: number }>;

export type ToggleValue = 0 | 1;

export interface ToggleOption {
  label: string;
  icon?: SvgIcon;
  activeIcon?: SvgIcon;
}

export interface ToggleButtonProps {
  options: readonly [ToggleOption, ToggleOption];
  value?: ToggleValue;
  defaultValue?: ToggleValue;
  onChange?: (value: ToggleValue) => void;
  disabled?: boolean;
  width?: DimensionValue;
  height?: number;
  containerStyle?: StyleProp<ViewStyle>;
  showIconWhenInactive?: boolean;
  testID?: string;
}

export const ToggleButton = ({
  options,
  value: controlledValue,
  defaultValue = 0,
  onChange,
  disabled = false,
  width = 138,
  height = 34,
  containerStyle,
  showIconWhenInactive = false,
  testID = 'toggle-button',
}: ToggleButtonProps) => {
  const [internalValue, setInternalValue] = useState<ToggleValue>(defaultValue);
  const value = controlledValue ?? internalValue;

  const handlePress = (next: ToggleValue) => {
    if (disabled) return;
    if (controlledValue === undefined) setInternalValue(next);
    onChange?.(next);
  };

  const renderedOptions = useMemo(() => options.slice(0, 2) as [ToggleOption, ToggleOption], [options]);

  return (
    <View
      testID={testID}
      accessibilityRole="tablist"
      style={[
        {
          width,
          height,
          borderRadius: borderRadius.full,
          backgroundColor: colors.primary[50],
          padding: 4,
          flexDirection: 'row',
          gap: 8,
          opacity: disabled ? 0.5 : 1,
        },
        containerStyle,
      ]}
    >
      {renderedOptions.map((opt, index) => {
        const isActive = value === index;
        const Icon = isActive ? opt.activeIcon ?? opt.icon : opt.icon;
        const shouldShowIcon = !!Icon && (isActive || showIconWhenInactive);
        const shouldPadInactiveTextRight = !isActive && value === 0 && index === 1;
        const shouldPadInactiveTextLeft = !isActive && value === 1 && index === 0;
        const shouldUnsetFlex = (value === 0 && index === 1) || (value === 1 && index === 0);

        return (
          <Pressable
            key={`${opt.label}-${index}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive, disabled }}
            accessibilityLabel={`${testID}-option-${index}`}
            disabled={disabled}
            onPress={() => handlePress(index as ToggleValue)}
            style={{
              flex: 1,
              borderRadius: borderRadius.full,
              backgroundColor: isActive ? colors.coolNeutral[10] : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: shouldShowIcon ? 4 : 0,
              ...(isActive ? { paddingHorizontal: 10, paddingVertical: 4 } : null),
              ...(shouldUnsetFlex ? { flex: undefined, flexGrow: 0, flexShrink: 0 } : null),
            }}
          >
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body3Semibold,
                color: isActive ? colors.primary[50] : colors.coolNeutral[10],
                ...(shouldPadInactiveTextRight ? { paddingVertical: 4, paddingRight: 8 } : null),
                ...(shouldPadInactiveTextLeft ? { paddingVertical: 4, paddingLeft: 8 } : null),
              }}
            >
              {opt.label}
            </Text>
            {shouldShowIcon ? <Icon width={16} height={16} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
};
