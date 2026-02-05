import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import ProgressBar from '@/components/common/Bar/ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Common/Bar/ProgressBar',
  component: ProgressBar,
  decorators: [
    (Story) => (
      <View className="">
        <Story />
      </View>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: {
    activeIndex: 0,
  },
};

export const TwoActive: Story = {
  args: {
    activeIndex: 1,
  },
};

export const ThreeActive: Story = {
  args: {
    activeIndex: 2,
  },
};

export const FourActive: Story = {
  args: {
    activeIndex: 3,
  },
};

export const FiveActive: Story = {
  args: {
    activeIndex: 4,
  },
};