import { useEffect, useState } from 'react';
import { fetchDashboard, type DashboardData } from '@/services/profileService';

interface UseUserDashboardDataParams {
  accessToken: string | null;
  loadProfile: () => Promise<void> | void;
  loadMyCars: () => Promise<void> | void;
}

export function useUserDashboardData({
  accessToken,
  loadProfile,
  loadMyCars,
}: UseUserDashboardDataParams) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    loadProfile();
    fetchDashboard().then(setDashboard).catch(() => {});
    loadMyCars();
  }, [accessToken, loadMyCars, loadProfile]);

  return { dashboard };
}
