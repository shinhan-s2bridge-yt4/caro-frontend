import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import NumberInput from '@/components/common/Input/NumberInput';

const meta: Meta<typeof NumberInput> = {
  title: 'Common/Input/NumberInput',
  component: NumberInput,
};

export default meta;

type Story = StoryObj<typeof NumberInput>;

/**
 * 1. 기본 상태 - 아무것도 안 눌렀을 때
 */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <View style={{ padding: 20 }}>
        <NumberInput
          label="이름"
          required
          placeholder="숫자만 입력해주세요."
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
        <NumberInput
          label="이름"
          required
          placeholder="숫자만 입력해주세요."
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
    const [value, setValue] = useState('27000');

    return (
      <View style={{ padding: 20 }}>
        <NumberInput
          label="이름"
          required
          placeholder="숫자만 입력해주세요."
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
export const Error: Story = {
  render: () => {
    const [value, setValue] = useState('27000원');

    return (
      <View style={{ padding: 20 }}>
        <NumberInput
          label="이름"
          required
          placeholder="이름을 입력해주세요."
          value={value}
          onChangeText={setValue}
          onClear={() => setValue('')}
          error="숫자로만 입력해주세요"
          autoFocus
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
    const [value, setValue] = useState('27000');

    return (
      <View style={{ padding: 20 }}>
        <NumberInput
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