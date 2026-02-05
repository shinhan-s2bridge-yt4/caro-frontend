import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { useState } from 'react';
import { CarButton } from '@/components/common/Button/CarButton';

const containerStyle = {
  padding: 20,
  gap: 12,
};

const meta: Meta<typeof CarButton> = {
  title: 'Common/Button/CarButton',
  component: CarButton,
  decorators: [
    (Story) => (
      <View style={containerStyle}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    label: {
      control: 'text',
      description: '버튼에 표시될 텍스트',
    },
    isSelected: {
      control: 'boolean',
      description: '선택 상태',
    },
    onPress: {
      action: 'pressed',
      description: '클릭 시 실행되는 콜백 함수',
    },
  },
};

export default meta;

type Story = StoryObj<typeof CarButton>;

export const Selected: Story = {
  args: {
    label: '기아',
    isSelected: true,
  },
};

export const Unselected: Story = {
  args: {
    label: '현대',
    isSelected: false,
  },
};

// 클릭 가능한 인터랙티브 스토리
export const Interactive: Story = {
  render: () => {
    const [isSelected, setIsSelected] = useState(false);
    
    return (
      <CarButton
        label="기아"
        isSelected={isSelected}
        onPress={() => setIsSelected(!isSelected)}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: '클릭하여 선택/해제 상태를 전환할 수 있습니다.',
      },
    },
  },
};

// Uncontrolled 버전 (자동으로 동작)
export const AutoToggle: Story = {
  args: {
    label: '쌍용',
  },
  parameters: {
    docs: {
      description: {
        story: 'isSelected prop 없이 사용 - 클릭하면 자동으로 토글됩니다.',
      },
    },
  },
};

// 여러 버튼을 함께 보여주는 스토리
export const MultipleButtons: Story = {
  render: () => {
    const [selectedBrand, setSelectedBrand] = useState<string>('현대');
    const brands = ['현대', '기아', '제네시스', '쌍용', 'KG모빌리티'];
    
    return (
      <View style={{ gap: 12 }}>
        {brands.map((brand) => (
          <CarButton
            key={brand}
            label={brand}
            isSelected={selectedBrand === brand}
            onPress={() => setSelectedBrand(brand)}
          />
        ))}
      </View>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '여러 버튼 중 하나만 선택할 수 있습니다 (라디오 버튼 형태).',
      },
    },
  },
};