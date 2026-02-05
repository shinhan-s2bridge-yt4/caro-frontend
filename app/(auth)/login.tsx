import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, borderRadius } from '@/theme';
import TextInput from '../../src/components/common/Input/TextInput';
import PasswordInput from '../../src/components/common/Input/PasswordInput';
import { KakaoButton } from '../../src/components/common/Button/KakaoButton';
import { GoogleButton } from '../../src/components/common/Button/GoogleButton';
import { MainButton } from '../../src/components/common/Button/MainButton';
import { loginWithEmail } from '@/services/authService';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const validatePassword = (value: string) => {
    const v = value.trim();
    if (v.length === 0) return '비밀번호를 입력해주세요.';
    if (v.length < 8) return '비밀번호는 8자 이상 입력해주세요.';
    return undefined;
  };

  const handleLogin = async () => {
    const err = validatePassword(password);
    if (err) {
      setPasswordError(err);
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert('로그인 실패', '아이디(이메일)를 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await loginWithEmail({
        email: trimmedEmail,
        password,
      });

      // zustand에 인증 상태 저장
      setAuth(result);

      // 로그인 성공 후 홈으로 이동
      router.replace('/home');
    } catch (e) {
      const message =
        axios.isAxiosError(e) && e.response?.data?.message
          ? String(e.response.data.message)
          : e instanceof Error
            ? e.message
            : '로그인 중 오류가 발생했습니다.';
      Alert.alert('로그인 실패', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKakaoLogin = () => {
    console.log('카카오 로그인');
  };

  const handleGoogleLogin = () => {
    console.log('구글 로그인');
  };

  const handleForgotPassword = () => {
    console.log('비밀번호 찾기');
  };

  const handleSignup = () => {
    router.push('/(auth)/signup');
  };

  // 로그인 버튼 활성화 여부 (이메일과 비밀번호가 모두 입력되었을 때)
  const isLoginEnabled = email.length > 0 && password.length > 0 && !isSubmitting;

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: colors.coolNeutral[10],
        paddingTop: 274,
        alignItems: 'center',
      }}
    >
    <View style={{ gap: 20 }}>
      {/* 아이디 입력 */}
      <TextInput
        label='아이디'
        value={email}
        onChangeText={setEmail}
        placeholder="example@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        onClear={() => setEmail('')}
      />

      {/* 비밀번호 입력 */}
      <PasswordInput
      label='비밀번호'
        value={password}
        onChangeText={(v) => {
          setPassword(v);
          setPasswordError(undefined);
        }}
        placeholder="8자 이상 입력해주세요"
        onClear={() => setPassword('')}
        onBlur={() => setPasswordError(validatePassword(password))}
        error={passwordError}
      />
      </View>

      {/* 비밀번호를 잊으셨나요? */}
      <Pressable
        onPress={handleForgotPassword}
        style={{ marginTop: 12, width: 334, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'flex-end', }}
      >
        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            fontSize: 12,
            fontWeight: 600,
            fontStyle: 'normal',
            color: colors.primary[50],
            textDecorationLine: 'underline',
          }}
        >
          비밀번호를 잊으셨나요?
        </Text>
      </Pressable>

      {/* 로그인 버튼 */}
      <View style={{ marginTop: 32, alignItems: 'center' }}>
        <MainButton
          label={isSubmitting ? '로그인 중...' : '로그인'}
          disabled={!isLoginEnabled}
          alwaysPrimary
          onPress={handleLogin}
        />
      </View>

      {/* 계정이 없으신가요? */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 8,
        }}
      >
        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.captionRegular,
            color: colors.coolNeutral[50],
          }}
        >
          계정이 없으신가요?{' '}
        </Text>
        <Pressable onPress={handleSignup}>
          <Text
            style={{
              fontFamily: typography.fontFamily.pretendard,
              ...typography.styles.captionSemibold,
              color: colors.primary[50],
              textDecorationLine: 'underline',

            }}
          >
            회원가입
          </Text>
        </Pressable>
      </View>

      {/* 또는 소셜로그인 */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 24,
          marginBottom: 24,
          width: 334,
        }}
      >
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: '#E5E7EB',
          }}
        />
        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.captionMedium,
            color: colors.coolNeutral[40],
            paddingHorizontal: 12,
          }}
        >
          또는 소셜로그인
        </Text>
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: '#E5E7EB',
          }}
        />
      </View>
      {/* 소셜 로그인 버튼 그룹 */}
      <View style={{ alignItems: 'center', gap:12}}>
        <KakaoButton />
        <GoogleButton />
      </View>
    </ScrollView>
  );
}