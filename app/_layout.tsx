import StorybookUIRoot from '../storybook';
import { Slot } from 'expo-router';

const isStorybookEnabled =
  process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true';

export default function RootLayout() {
  if (isStorybookEnabled) {
    return <StorybookUIRoot />;
  }

  return <Slot />;
}
