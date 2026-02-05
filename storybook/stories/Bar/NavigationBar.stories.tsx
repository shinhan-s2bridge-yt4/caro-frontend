// NavigationBar.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { NavigationBar } from '@/components/common/Bar/NavigationBar';
import { View } from 'react-native';
import { useState } from 'react';

const meta = {
  title: 'Common/Bar/NavigationBar',
  component: NavigationBar,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    active: {
      control: 'select',
      options: ['home', 'car', 'coin', 'store', 'user'],
      description: '현재 활성화된 탭',
    },
    onPress: { 
      action: 'tab pressed',
      description: '탭 클릭 시 실행되는 콜백 함수',
    },
  },
} satisfies Meta<typeof NavigationBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = {
  args: {
    active: 'home',
  },
};

export const Car: Story = {
  args: {
    active: 'car',
  },
};

export const Coin: Story = {
  args: {
    active: 'coin',
  },
};

export const Store: Story = {
  args: {
    active: 'store',
  },
};

export const User: Story = {
  args: {
    active: 'user',
  },
};

// 클릭 가능한 인터랙티브 스토리
export const Interactive: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState<'home' | 'car' | 'coin' | 'store' | 'user'>('home');
    
    return (
      <NavigationBar
        active={activeTab}
        onPress={(tab) => setActiveTab(tab as typeof activeTab)}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: '클릭하여 탭을 전환할 수 있습니다. 실제 동작을 확인해보세요.',
      },
    },
  },
};

// Uncontrolled 버전 (자동으로 동작)
export const Uncontrolled: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'active prop 없이 사용 - 컴포넌트가 자체적으로 상태를 관리합니다.',
      },
    },
  },
};