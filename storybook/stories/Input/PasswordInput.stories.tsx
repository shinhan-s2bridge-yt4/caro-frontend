import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import PasswordInput from '@/components/common/Input/PasswordInput';

const meta: Meta<typeof PasswordInput> = {
  title: 'Common/Input/PasswordInput',
  component: PasswordInput,
};

export default meta;

type Story = StoryObj<typeof PasswordInput>;

/**
 * 1. 기본 상태 - 아무것도 안 눌렀을 때
 */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <View style={{ padding: 20 }}>
        <PasswordInput
          label="비밀번호"
          required
          placeholder="비밀번호를 입력해주세요."
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
        <PasswordInput
          label="비밀번호"
          required
          placeholder="비밀번호를 입력해주세요."
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
 * - 값이 있으면 eye 아이콘이 노출되어 토글 테스트 가능
 */
export const Typing: Story = {
  render: () => {
    const [value, setValue] = useState('password1234');

    return (
      <View style={{ padding: 20 }}>
        <PasswordInput
          label="비밀번호"
          required
          placeholder="비밀번호를 입력해주세요."
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
 * 4. 에러 상태
 */
export const Error: Story = {
  render: () => {
    const [value, setValue] = useState('pass');

    return (
      <View style={{ padding: 20 }}>
        <PasswordInput
          label="비밀번호"
          required
          placeholder="비밀번호를 입력해주세요."
          value={value}
          onChangeText={setValue}
          onClear={() => setValue('')}
          error="비밀번호는 8자 이상 입력해주세요."
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
    const [value, setValue] = useState('password1234');

    return (
      <View style={{ padding: 20 }}>
        <PasswordInput
          label="비밀번호"
          required
          placeholder="비밀번호를 입력해주세요."
          value={value}
          onChangeText={setValue}
          onClear={() => setValue('')}
          disabled
        />
      </View>
    );
  },
};