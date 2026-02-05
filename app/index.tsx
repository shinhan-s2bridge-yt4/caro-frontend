import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography } from '@/theme';

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
        gap: 24,
      }}
    >
      <Text
        style={{
          fontFamily: typography.fontFamily.pretendard,
          fontSize: 60,
          fontWeight: '900',
          color: colors.primary[50],
        }}
      >
        CARO
      </Text>
      <Text
        style={{
          fontFamily: typography.fontFamily.pretendard,
          ...typography.styles.body1Medium,
          color: colors.coolNeutral[40],
          textAlign: 'center',
        }}
      >
        스마트한 차량 관리{'\n'}은행 기록부터 지출 관리까지
      </Text>
    </View>
  );
}