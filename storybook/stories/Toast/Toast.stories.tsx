import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';
import { View, Pressable, Text } from 'react-native';
import { Toast } from '@/components/common/Toast/Toast';

const containerStyle = {
  flex: 1,
  padding: 20,
  backgroundColor: '#F5F6FA',
  minHeight: 300,
};

const buttonStyle = {
  backgroundColor: '#4880ED',
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 8,
  alignItems: 'center' as const,
};

const buttonTextStyle = {
  color: '#FFF',
  fontSize: 16,
  fontWeight: '600' as const,
};

const ToastWithTrigger = (args: React.ComponentProps<typeof Toast>) => {
  const [visible, setVisible] = useState(true);

  return (
    <View style={containerStyle}>
      <Pressable style={buttonStyle} onPress={() => setVisible(true)}>
        <Text style={buttonTextStyle}>토스트 보기</Text>
      </Pressable>
      <Toast
        {...args}
        visible={visible}
        onDismiss={() => setVisible(false)}
      />
    </View>
  );
};

const meta: Meta<typeof Toast> = {
  title: 'Common/Toast',
  component: Toast,
  decorators: [
    (Story) => (
      <View style={containerStyle}>
        <Story />
      </View>
    ),
  ],
  args: {
    message: '운행기록이 저장 되었어요!',
    visible: true,
    actionLabel: '보러가기',
    duration: 0,
    onAction: () => console.log('Action pressed'),
    onDismiss: () => console.log('Toast dismissed'),
  },
};

export default meta;

type Story = StoryObj<typeof Toast>;

/** 기본 토스트 (액션 버튼 포함) */
export const Default: Story = {};

/** 액션 버튼 없는 토스트 */
export const WithoutAction: Story = {
  args: {
    actionLabel: undefined,
    message: '저장되었습니다.',
  },
};

/** 긴 메시지 토스트 */
export const LongMessage: Story = {
  args: {
    message: '운행기록이 정상적으로 저장되었어요!',
    actionLabel: '확인',
  },
};

/** 자동 숨김 토스트 (3초) */
export const AutoHide: Story = {
  args: {
    duration: 3000,
    message: '3초 후 자동으로 사라집니다.',
    actionLabel: undefined,
  },
};

/** 인터랙티브 토스트 (버튼으로 트리거) */
export const Interactive: Story = {
  render: (args) => <ToastWithTrigger {...args} />,
  args: {
    message: '운행기록이 저장 되었어요!',
    actionLabel: '보러가기',
    duration: 3000,
  },
};
