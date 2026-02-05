import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import TextInput from '@/components/common/Input/TextInput';

const meta: Meta<typeof TextInput> = {
  title: 'Common/Input/TextInput',
  component: TextInput,
};

export default meta;

type Story = StoryObj<typeof TextInput>;

/**
 * 1. 기본 상태 - 아무것도 안 눌렀을 때
 */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <View style={{ padding: 20 }}>
        <TextInput
          label="이름"
          required
          placeholder="이름을 입력해주세요."
          value={value}
          onChangeText={setValue}
          onClear={() => setValue('')}
        />
      </View>
    );
  },
};

/**
 * 2. 눌렀을 때 (포커스)
 */
export const Focused: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <View style={{ padding: 20 }}>
        <TextInput
          label="이름"
          required
          placeholder="이름을 입력해주세요."
          value={value}
          onChangeText={setValue}
          onClear={() => setValue('')}
          autoFocus
        />
      </View>
    );
  },
};

/**
 * 3. 텍스트 입력 중일 때
 */
export const Typing: Story = {
  render: () => {
    const [value, setValue] = useState('이름을 입력해주세요.');

    return (
      <View style={{ padding: 20 }}>
        <TextInput
          label="이름"
          required
          placeholder="이름을 입력해주세요."
          value={value}
          onChangeText={setValue}
          onClear={() => setValue('')}
          autoFocus
        />
      </View>
    );
  },
};

/**
 * 4. 오류 메시지 나타날 때
 */
export const WithError: Story = {
  render: () => {
    const [value, setValue] = useState('이름을 입력해주세요.');

    return (
      <View style={{ padding: 20 }}>
        <TextInput
          label="이름"
          required
          placeholder="이름을 입력해주세요."
          value={value}
          onChangeText={setValue}
          onClear={() => setValue('')}
          error="오류메세지를 나타내요"
        />
      </View>
    );
  },
};

/**
 * 5. 입력 완료 되었을 때 (비활성화)
 */
export const Disabled: Story = {
  render: () => {
    const [value, setValue] = useState('텍스트 입력 완료 되었을 때');

    return (
      <View style={{ padding: 20 }}>
        <TextInput
          label="이름"
          required
          placeholder="이름을 입력해주세요."
          value={value}
          onChangeText={setValue}
          onClear={() => setValue('')}
          disabled
        />
      </View>
    );
  },
};