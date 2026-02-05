import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography } from '@/theme';
import { MainButton } from '@/components/common/Button/MainButton';
import { useAuth } from '@/hooks/useAuth';
import { NavigationBar } from '@/components/common/Bar/NavigationBar';

export default function HomeScreen() {
  const router = useRouter();
  const { isLoggedIn, memberId, accessToken, clearAuth } = useAuth();

  return (
    <View style={{ flex: 1, backgroundColor: colors.coolNeutral[10] }}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 20,
          gap: 24,
        }}
      >
        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.body1Bold,
            color: colors.coolNeutral[90],
          }}
        >
          홈
        </Text>

        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.body2Medium,
            color: colors.coolNeutral[50],
            textAlign: 'center',
          }}
        >
          로그인 성공 후 이동하는 테스트용 홈 화면입니다.
          {'\n'}
          {isLoggedIn
            ? `로그인됨 (memberId: ${memberId ?? '-'})`
            : '로그아웃 상태'}
        </Text>

        {isLoggedIn && (
          <Text
            style={{
              fontFamily: typography.fontFamily.pretendard,
              ...typography.styles.captionMedium,
              color: colors.coolNeutral[40],
              textAlign: 'center',
            }}
          >
            accessToken: {accessToken ? `${accessToken.slice(0, 16)}...` : '-'}
          </Text>
        )}

        {isLoggedIn && (
          <MainButton
            label="로그아웃"
            alwaysPrimary
            onPress={() => {
              clearAuth();
              router.replace('/(auth)/login');
            }}
          />
        )}

        <MainButton
          label="다시 로그인 화면으로"
          alwaysPrimary
          onPress={() => router.replace('/(auth)/login')}
        />
      </View>

      <NavigationBar
        active="home"
        showBorder
        onPress={(tab) => {
          const to =
            tab === 'home'
              ? '/home'
              : tab === 'car'
                ? '/car'
                : tab === 'coin'
                  ? '/coin'
                  : tab === 'store'
                    ? '/store'
                    : '/user';
          router.push(to);
        }}
      />
    </View>
  );
}

