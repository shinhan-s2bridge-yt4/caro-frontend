import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import CarTypeInput from '@/components/common/Input/CarTypeInput';

const meta: Meta<typeof CarTypeInput> = {
  title: 'Common/Input/CarTypeInput',
  component: CarTypeInput,
};

export default meta;

type Story = StoryObj<typeof CarTypeInput>;

/**
 * 1. 기본 상태 - 아무것도 입력 안 한 상태
 */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <View style={{ padding: 20 }}>
        <CarTypeInput
          label="차종검색"
          required
          placeholder="차종을 검색해주세요."
          value={value}
          onChangeText={setValue}
          onCheckDuplicate={() => {
            console.log('검색');
          }}
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
        <CarTypeInput
          label="차종검색"
          required
          placeholder="차종을 검색해주세요."
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
 * 2. 확인 완료 상태
 */
export const Completed: Story = {
  render: () => {
    const [value, setValue] = useState('이메일');

    return (
      <View style={{ padding: 20 }}>
        <CarTypeInput
          label="차종검색"
          required
          placeholder="차종을 검색해주세요."
          value={value}
          onChangeText={setValue}
          onCheckDuplicate={() => {}}
          completed
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
    const [value, setValue] = useState('텍스트');

    return (
      <View style={{ padding: 20 }}>
        <CarTypeInput
          label="차종검색"
          required
          placeholder="차종을 검색해주세요."
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
    const [value, setValue] = useState('텍스트');

    return (
      <View style={{ padding: 20 }}>
        <CarTypeInput 
          label="차종검색"
          required
          placeholder="차종을 검색해주세요."
          value={value}
          onChangeText={setValue}
          onCheckDuplicate={() => {}}
          error="차종이 검색되지 않아요."
        />
      </View>
    );
  },
};
