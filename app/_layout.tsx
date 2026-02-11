import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import StorybookUIRoot from '../storybook';
import { Slot } from 'expo-router';

// 폰트 로딩 전까지 스플래시 화면 유지
SplashScreen.preventAutoHideAsync();

const isStorybookEnabled =
  process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Pretendard: require('@/assets/fonts/PretendardVariable.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  if (isStorybookEnabled) {
    return <StorybookUIRoot />;
  }

  return <Slot />;
}
