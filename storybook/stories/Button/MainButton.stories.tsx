import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { MainButton } from '@/components/common/Button/MainButton';

const containerStyle = {
  padding: 20,
};

const meta: Meta<typeof MainButton> = {
  title: 'Common/Button/MainButton',
  component: MainButton,
  decorators: [
    (Story) => (
      <View style={containerStyle}>
        <Story />
      </View>
    ),
  ],
  args: {
    label: '다음',
    disabled: false,
    onPress: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof MainButton>;

export const Enabled: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
