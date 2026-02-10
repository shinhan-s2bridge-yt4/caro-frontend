import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography } from '@/theme';
import LogoIcon from '../assets/icons/logo.svg';

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.coolNeutral[10],
        alignItems: 'center',
        justifyContent: 'center',
        gap: 30,
      }}
    >
      <LogoIcon />
      <Text
        style={{
          fontFamily: typography.fontFamily.pretendard,
          ...typography.styles.body1Medium,
          color: colors.primary[50],
          textAlign: 'center',
        }}
      >
        타는 순간부터 쌓이는,{'\n'}나만의 운행 리워드 서비스
      </Text>
    </View>
  );
}