import { selectIsLoggedIn, useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const memberId = useAuthStore((s) => s.memberId);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const accessTokenExpiresIn = useAuthStore((s) => s.accessTokenExpiresIn);
  const refreshTokenExpiresIn = useAuthStore((s) => s.refreshTokenExpiresIn);
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return {
    memberId,
    accessToken,
    refreshToken,
    accessTokenExpiresIn,
    refreshTokenExpiresIn,
    isLoggedIn,
    setAuth,
    clearAuth,
  };
}

