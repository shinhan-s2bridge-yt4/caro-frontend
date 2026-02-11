import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { useState } from 'react';
import { ToggleButton, type ToggleOption, type ToggleValue } from '@/components/common/Button/ToggleButton';

import CoinIcon from '@/assets/icons/coin.svg';
import BCarIcon from '@/assets/icons/bcar.svg';

const containerStyle = {
  padding: 20,
  gap: 12,
};

type StoryArgs = {
  leftLabel: string;
  rightLabel: string;
  defaultValue: ToggleValue;
  disabled: boolean;
  withIcons: boolean;
  showIconWhenInactive: boolean;
};

const StoryToggleButton = ({
  leftLabel,
  rightLabel,
  defaultValue,
  disabled,
  withIcons,
  showIconWhenInactive,
}: StoryArgs) => {
  const options: [ToggleOption, ToggleOption] = [
    {
      label: leftLabel,
      ...(withIcons
        ? { icon: BCarIcon, activeIcon: BCarIcon }
        : {}),
    },
    {
      label: rightLabel,
      ...(withIcons
        ? { icon: CoinIcon, activeIcon: CoinIcon }
        : {}),
    },
  ];

  return (
    <ToggleButton
      options={options}
      defaultValue={defaultValue}
      disabled={disabled}
      showIconWhenInactive={showIconWhenInactive}
    />
  );
};

const meta: Meta<typeof StoryToggleButton> = {
  title: 'Common/Button/ToggleButton',
  component: StoryToggleButton,
  decorators: [
    (Story) => (
      <View style={containerStyle}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    leftLabel: { control: 'text', description: '왼쪽 라벨' },
    rightLabel: { control: 'text', description: '오른쪽 라벨' },
    defaultValue: {
      control: { type: 'radio' },
      options: [0, 1],
      description: '초기 선택 값 (uncontrolled)',
    },
    disabled: { control: 'boolean', description: '비활성화 여부' },
    withIcons: { control: 'boolean', description: '아이콘 표시 여부' },
    showIconWhenInactive: {
      control: 'boolean',
      description: '비활성(선택되지 않은) 쪽에도 아이콘을 표시',
    },
  },
  args: {
    leftLabel: '운행기록',
    rightLabel: '포인트',
    defaultValue: 0,
    disabled: false,
    withIcons: true,
    showIconWhenInactive: false,
  },
};

export default meta;

type Story = StoryObj<typeof StoryToggleButton>;

export const Default: Story = {};


export const InteractiveControlled: Story = {
  render: () => {
    const [value, setValue] = useState<ToggleValue>(0);
    const options: [ToggleOption, ToggleOption] = [
      { label: '운행기록', icon: BCarIcon, activeIcon: BCarIcon },
      { label: '포인트', icon: CoinIcon, activeIcon: CoinIcon },
    ];

    return (
      <ToggleButton
        options={options}
        value={value}
        onChange={(next) => setValue(next)}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'controlled 모드: value/onChange로 외부 상태에서 토글을 제어합니다.',
      },
    },
  },
};
