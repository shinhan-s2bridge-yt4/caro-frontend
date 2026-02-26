import type { GestureResponderEvent } from 'react-native';
import { colors } from '@/theme';
import GoogleIcon from '@/assets/icons/google.svg';
import { SocialLoginButtonBase } from '@/components/common/Button/SocialLoginButtonBase';

interface GoogleButtonProps {
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
}

export const GoogleButton = ({ onPress, disabled = false }: GoogleButtonProps) => {
  return (
    <SocialLoginButtonBase
      label="구글로 로그인하기"
      icon={GoogleIcon}
      backgroundColor={colors.background.default}
      onPress={onPress}
      disabled={disabled}
    />
  );
};
