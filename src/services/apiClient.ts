import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { reissueToken } from '@/services/authService';

function getApiBaseUrl() {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
  return base.replace(/\/+$/, '');
}

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: accessToken 자동 주입
apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// 토큰 재발급 중복 방지
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

// 응답 인터셉터: 401 시 토큰 재발급 후 재시도
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401이 아니거나 이미 재시도한 요청이면 그대로 에러 반환
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // reissue 요청 자체가 401이면 로그아웃
    if (originalRequest.url?.includes('/api/v1/auth/reissue')) {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      // 이미 재발급 중이면 대기열에 추가
      return new Promise((resolve) => {
        addRefreshSubscriber((newToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const { refreshToken } = useAuthStore.getState();

      if (!refreshToken) {
        // refreshToken 없으면 로그아웃
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      const result = await reissueToken({ refreshToken });

      // 새 토큰 저장
      const { memberId } = useAuthStore.getState();
      useAuthStore.getState().setAuth({
        memberId: memberId!,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        accessTokenExpiresIn: result.accessTokenExpiresIn,
        refreshTokenExpiresIn: result.refreshTokenExpiresIn,
      });

      // 대기 중인 요청들에 새 토큰 전달
      onRefreshed(result.accessToken);

      // 원래 요청 재시도
      originalRequest.headers.Authorization = `Bearer ${result.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      // 재발급 실패 시 로그아웃
      refreshSubscribers = [];
      useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
