import type { GestureResponderEvent } from 'react-native';
import { colors } from '@/theme';
import KakaoIcon from '@/assets/icons/kakao.svg';
import { SocialLoginButtonBase } from '@/components/common/Button/SocialLoginButtonBase';

interface KakaoButtonProps {
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
}

export const KakaoButton = ({ onPress, disabled = false }: KakaoButtonProps) => {
  return (
    <SocialLoginButtonBase
      label="카카오톡으로 로그인하기"
      icon={KakaoIcon}
      iconWidth={26}
      iconHeight={24}
      backgroundColor="#FEE500"
      onPress={onPress}
      disabled={disabled}
    />
  );
};
