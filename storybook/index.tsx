import { view } from './storybook.requires';

const memoryStorage = new Map<string, string>();

const StorybookUIRoot = view.getStorybookUI({
  storage: {
    getItem: async (key) => memoryStorage.get(key) ?? null,
    setItem: async (key, value) => {
      memoryStorage.set(key, value);
    },
  },
});

export default StorybookUIRoot;
