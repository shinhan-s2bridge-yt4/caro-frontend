import { create } from 'zustand';
import { logout as logoutApi } from '@/services/authService';
import { useSignupDraftStore } from '@/stores/signupDraftStore';

type AuthState = {
  memberId: number | null;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresIn: number | null;
  refreshTokenExpiresIn: number | null;
  isLoggingOut: boolean;
  setAuth: (payload: {
    memberId: number;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresIn?: number;
    refreshTokenExpiresIn?: number;
  }) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  memberId: null,
  accessToken: null,
  refreshToken: null,
  accessTokenExpiresIn: null,
  refreshTokenExpiresIn: null,
  isLoggingOut: false,
  setAuth: (payload) =>
    set({
      memberId: payload.memberId,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      accessTokenExpiresIn: payload.accessTokenExpiresIn ?? null,
      refreshTokenExpiresIn: payload.refreshTokenExpiresIn ?? null,
    }),
  clearAuth: () =>
    set({
      memberId: null,
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresIn: null,
      refreshTokenExpiresIn: null,
    }),
  logout: async () => {
    const { accessToken, isLoggingOut } = get();
    if (isLoggingOut) return;

    set({ isLoggingOut: true });
    try {
      if (accessToken) {
        await logoutApi({ accessToken });
      }
    } catch (e) {
      // 서버 로그아웃 실패해도 로컬 상태는 정리
    } finally {
      set({
        memberId: null,
        accessToken: null,
        refreshToken: null,
        accessTokenExpiresIn: null,
        refreshTokenExpiresIn: null,
        isLoggingOut: false,
      });
      useSignupDraftStore.getState().clearDraft();
    }
  },
}));

export const selectIsLoggedIn = (s: Pick<AuthState, 'accessToken'>) =>
  Boolean(s.accessToken);

