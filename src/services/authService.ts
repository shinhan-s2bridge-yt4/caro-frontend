import axios from 'axios';

import type { ApiResponse } from '@/types/vehicle';
import type {
  LoginRequest,
  LoginResponseData,
  SignUpRequest,
  SignUpResponseData,
} from '@/types/auth';

type EmailExistsResponse = {
  exists: boolean;
};

function getApiBaseUrl() {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
  return base.replace(/\/+$/, '');
}

export async function loginWithEmail(
  payload: LoginRequest,
): Promise<LoginResponseData> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL 이 설정되어있지 않습니다.');
  }

  const { data } = await axios.post<ApiResponse<LoginResponseData>>(
    `${baseUrl}/api/v1/auth/login`,
    payload,
  );

  return data.data;
}

export async function signUpWithEmail(
  payload: SignUpRequest,
): Promise<SignUpResponseData> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL 이 설정되어있지 않습니다.');
  }

  const { data } = await axios.post<ApiResponse<SignUpResponseData>>(
    `${baseUrl}/api/v1/auth/sign-up`,
    payload,
  );

  return data.data;
}

export async function checkEmailExists(email: string): Promise<boolean> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL 이 설정되어있지 않습니다.');
  }

  const { data } = await axios.get<ApiResponse<EmailExistsResponse>>(
    `${baseUrl}/api/v1/auth/email/exists`,
    {
      params: { email },
    },
  );

  return data.data?.exists ?? false;
}

export async function logout(params: { accessToken: string }): Promise<void> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL 이 설정되어있지 않습니다.');
  }
  if (!params.accessToken) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  await axios.post<ApiResponse<unknown>>(
    `${baseUrl}/api/v1/auth/logout`,
    null,
    {
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
      },
    },
  );
}
