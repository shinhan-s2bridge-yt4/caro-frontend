import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { colors, typography } from '@/theme';
import { checkEmailExists } from '@/services/authService';
import { useSignupDraftStore } from '@/stores/signupDraftStore';

import ProgressBar from '../../src/components/common/Bar/ProgressBar';
import TextInput from '../../src/components/common/Input/TextInput';
import EmailInput from '../../src/components/common/Input/EmailInput';
import PasswordInput from '../../src/components/common/Input/PasswordInput';
import { MainButton } from '../../src/components/common/Button/MainButton';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';

const EMAIL_REGEX =
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const SCREEN_MAX_WIDTH = 375;

export default function SignupScreen() {
  const router = useRouter();
  const setAccount = useSignupDraftStore((s) => s.setAccount);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [nameError, setNameError] = useState<string | undefined>();
  const [emailError, setEmailError] = useState<string | undefined>();
  const [emailSuccess, setEmailSuccess] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();

  const trimmedName = useMemo(() => name.trim(), [name]);
  const trimmedEmail = useMemo(() => email.trim(), [email]);
  const trimmedPassword = useMemo(() => password.trim(), [password]);

  const isEmailValid = useMemo(() => EMAIL_REGEX.test(email.trim()), [email]);
  const isNameValid = useMemo(
    () => trimmedName.length >= 2 && trimmedName.length <= 20,
    [trimmedName],
  );
  const isPasswordValid = useMemo(() => {
    const len = trimmedPassword.length;
    return len >= 8 && len <= 20;
  }, [trimmedPassword]);
  const isEmailChecked = useMemo(
    () => !!emailSuccess && !emailError,
    [emailSuccess, emailError],
  );

  const isNextEnabled = useMemo(() => {
    return (
      isNameValid &&
      isEmailValid &&
      isEmailChecked &&
      isPasswordValid
    );
  }, [isNameValid, isEmailValid, isEmailChecked, isPasswordValid]);

  const validateName = (value: string) => {
    const v = value.trim();
    if (v.length === 0) return '이름을 입력해주세요.';
    if (v.length < 2 || v.length > 20) return '이름은 2~20자로 입력해주세요.';
    return undefined;
  };

  const validateEmail = (value: string) => {
    const v = value.trim();
    if (v.length === 0) return '이메일을 입력해주세요.';
    if (!EMAIL_REGEX.test(v)) return '이메일 형식이 올바르지 않아요.';
    return undefined;
  };

  const validatePassword = (value: string) => {
    const v = value.trim();
    if (v.length === 0) return '비밀번호를 입력해주세요.';
    if (v.length < 8 || v.length > 20) return '비밀번호는 8~20자로 입력해주세요.';
    return undefined;
  };

  const handleCheckDuplicateEmail = async () => {
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      setEmailSuccess(undefined);
      return;
    }

    try {
      const exists = await checkEmailExists(trimmedEmail);
      if (exists) {
        setEmailSuccess(undefined);
        setEmailError('이미 가입된 이메일이에요.');
        return;
      }

      setEmailError(undefined);
      setEmailSuccess('사용 가능한 이메일이에요.');
    } catch {
      setEmailSuccess(undefined);
      setEmailError('중복 확인에 실패했어요. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleNext = () => {
    if (!isNextEnabled) return;

    setAccount({
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
    });
    router.push('/(auth)/vehicle-brand');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.coolNeutral[10] }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: 'center',
          }}
        >
          {/* 넓은 화면에서 내용 폭 고정 */}
          <View style={{ flex: 1, width: '100%', maxWidth: SCREEN_MAX_WIDTH }}>
            {/* 상단: 뒤로가기 */}
            <View style={{ paddingVertical: 12, paddingHorizontal: 20 }}>
              <Pressable
                onPress={() => router.replace('/(auth)/login')}
                style={{ width: 24, height: 24, justifyContent: 'center' }}
              >
                <ArrowLeftIcon width={24} height={24} />
              </Pressable>
            </View>

            {/* 진행바: 다음 줄 */}
            <View style={{ marginTop: 10, width: '100%', alignItems: 'center' }}>
              <ProgressBar total={5} activeIndex={0} />
            </View>

            {/* 타이틀 */}
            <View style={{ marginTop: 46, paddingHorizontal: 20 }}>
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.h2Semibold,
                  color: colors.coolNeutral[80],
                }}
              >
                계정 정보를 입력해주세요
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body2Regular,
                  color: colors.coolNeutral[40],
                }}
              >
                안전한 차량 관리를 위해 정보가 필요해요
              </Text>
            </View>

            {/* 입력 폼 */}
            <View style={{ marginTop: 46, alignItems: 'center', gap: 28 }}>
              <TextInput
                label="이름"
                required
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  setNameError(undefined);
                }}
                onBlur={() => setNameError(validateName(name))}
                placeholder="이름을 입력해주세요."
              maxLength={20}
                onClear={() => {
                  setName('');
                  setNameError(undefined);
                }}
                error={nameError}
              />

              <EmailInput
                label="이메일"
                required
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setEmailError(undefined);
                  setEmailSuccess(undefined);
                }}
                onBlur={() => setEmailError(validateEmail(email))}
                placeholder="이메일을 입력해주세요"
                keyboardType="email-address"
                autoCapitalize="none"
                onClear={() => {
                  setEmail('');
                  setEmailError(undefined);
                  setEmailSuccess(undefined);
                }}
                onCheckDuplicate={handleCheckDuplicateEmail}
                error={emailError}
                success={emailSuccess}
              />

              <PasswordInput
                label="비밀번호"
                required
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  setPasswordError(undefined);
                }}
                onBlur={() => setPasswordError(validatePassword(password))}
              placeholder="8~20자로 입력해주세요"
              maxLength={20}
                onClear={() => {
                  setPassword('');
                  setPasswordError(undefined);
                }}
                error={passwordError}
              />
            </View>

            {/* 하단 버튼 */}
            <View style={{ flex: 1 }} />
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <MainButton
                label="다음"
                disabled={!isNextEnabled}
                alwaysPrimary
                onPress={handleNext}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
