import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import Category from '@/components/common/Category/CategoryTab';
import { CategoryKey } from '@/constants/categories';

const meta: Meta<typeof Category> = {
  title: 'Common/Category/CategoryTab',
  component: Category,
};

export default meta;

type Story = StoryObj<typeof Category>;

/**
 * 기본 상태
 * - 전체(ALL) 선택
 * - 클릭 시 선택 변경 확인용
 */
export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState<CategoryKey>('ALL');

    return (
      <View style={{ padding: 16 }}>
        <Category
          selected={selected}
          onSelect={setSelected}
        />
      </View>
    );
  },
};

/**
 * 주유비 선택된 상태
 */
export const FuelSelected: Story = {
  render: () => {
    const [selected, setSelected] = useState<CategoryKey>('FUEL');

    return (
      <View style={{ padding: 16 }}>
        <Category
          selected={selected}
          onSelect={setSelected}
        />
      </View>
    );
  },
};
