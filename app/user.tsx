import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography } from '@/theme';
import { NavigationBar } from '@/components/common/Bar/NavigationBar';

export default function UserScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.coolNeutral[10] }}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 20,
          gap: 12,
        }}
      >
        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.body1Bold,
            color: colors.coolNeutral[90],
          }}
        >
          마이페이지
        </Text>
        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.body2Medium,
            color: colors.coolNeutral[50],
            textAlign: 'center',
          }}
        >
          NavigationBar 라우팅 테스트용 페이지입니다.
        </Text>
      </View>

      <NavigationBar
        active="user"
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

