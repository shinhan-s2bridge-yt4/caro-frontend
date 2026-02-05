import { create } from 'zustand';

type AuthState = {
  memberId: number | null;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresIn: number | null;
  refreshTokenExpiresIn: number | null;
  setAuth: (payload: {
    memberId: number;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresIn?: number;
    refreshTokenExpiresIn?: number;
  }) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  memberId: null,
  accessToken: null,
  refreshToken: null,
  accessTokenExpiresIn: null,
  refreshTokenExpiresIn: null,
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
}));

export const selectIsLoggedIn = (s: Pick<AuthState, 'accessToken'>) =>
  Boolean(s.accessToken);

