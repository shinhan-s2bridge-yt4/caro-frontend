import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import EmailInput from '@/components/common/Input/EmailInput';

const meta: Meta<typeof EmailInput> = {
  title: 'Common/Input/EmailInput',
  component: EmailInput,
};

export default meta;

type Story = StoryObj<typeof EmailInput>;

/**
 * 1. 기본 상태 - 아무것도 입력 안 한 상태
 */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <View style={{ padding: 20 }}>
        <EmailInput
          label="이메일"
          required
          placeholder="이메일을 입력해주세요."
          value={value}
          onChangeText={setValue}
          onCheckDuplicate={() => {
            console.log('중복확인');
          }}
        />
      </View>
    );
  },
};

/**
 * 2. 확인 완료 상태
 */
export const Focused: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <View style={{ padding: 20 }}>
        <EmailInput
          label="이메일"
          required
          placeholder="이메일을 입력해주세요."
          value={value}
          onChangeText={setValue}
          onCheckDuplicate={() => {}}
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
    const [value, setValue] = useState('test@email.com');

    return (
      <View style={{ padding: 20 }}>
        <EmailInput
          label="이메일"
          required
          placeholder="이메일을 입력해주세요."
          value={value}
          onChangeText={setValue}
          onCheckDuplicate={() => {}}
          autoFocus
        />
      </View>
    );
  },
};

/**
 * 4. 오류 메시지 나타날 때 (중복 확인 실패)
 */
export const Error: Story = {
  render: () => {
    const [value, setValue] = useState('duplicate@email.com');

    return (
      <View style={{ padding: 20 }}>
        <EmailInput
          label="이메일"
          required
          placeholder="이메일을 입력해주세요."
          value={value}
          onChangeText={setValue}
          onCheckDuplicate={() => {}}
          error="오류 메세지를 나타내요."
        />
      </View>
    );
  },
};

/**
 * 5. 입력 완료 되었을 때 (중복확인 성공 + 비활성화)
 */
export const Success: Story = {
  render: () => {
    const [value, setValue] = useState('available@email.com');

    return (
      <View style={{ padding: 20 }}>
        <EmailInput
          label="이메일"
          required
          placeholder="이메일을 입력해주세요."
          value={value}
          onChangeText={setValue}
          onCheckDuplicate={() => {}}
          success="성공메세지를 나타내요."
        />
      </View>
    );
  },
};
