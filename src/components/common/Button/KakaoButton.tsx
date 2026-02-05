import { View, Text } from 'react-native';
import { typography, colors, borderRadius } from '@/theme';
import KakaoIcon from '../../../../assets/icons/kakao.svg';

export const KakaoButton = () => {
  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          width: 335,
          height: 48,
          borderRadius: borderRadius.md,  // 12px
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FEE500', // 그냥 흰색 버튼
          flexDirection: 'row',
          gap: 20,
        }}
      >
        <KakaoIcon width={26} height={24} />
        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.body2Semibold,
            color: colors.coolNeutral[60], // 텍스트 색
          }}
        >
          카카오톡으로 로그인하기
        </Text>
      </View>
    </View>
  );
};
