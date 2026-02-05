import { View, Text } from 'react-native';
import { typography, colors, borderRadius } from '@/theme';
import GoogleIcon from '../../../../assets/icons/google.svg';

export const GoogleButton = () => {
  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          width: 335,
          height: 48,
          borderRadius: borderRadius.md,  // 12px
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background.default, // 그냥 흰색 버튼
          flexDirection: 'row',
          gap: 20,
        }}
      >
        <GoogleIcon width={24} height={24} />
        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.body2Semibold,
            color: colors.coolNeutral[60], // 텍스트 색
          }}
        >
          구글로 로그인하기
        </Text>
      </View>
    </View>
  );
};
