import type { Preview } from '@storybook/react-native';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on.*' },
  },
};

export default preview;
