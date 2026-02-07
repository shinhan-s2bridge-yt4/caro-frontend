import { create } from 'zustand';
import { fetchProfile, updateProfile as updateProfileApi } from '@/services/profileService';
import type { UpdateProfileRequest } from '@/services/profileService';
import type { ProfileData, PrimaryCar } from '@/types/profile';

type ProfileState = {
  name: string;
  email: string;
  primaryCar: PrimaryCar | null;
  isLoading: boolean;
  error: string | null;
  loadProfile: (accessToken: string) => Promise<void>;
  updateProfile: (accessToken: string, request: UpdateProfileRequest) => Promise<void>;
  setProfile: (data: Partial<ProfileData>) => void;
  clearProfile: () => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  name: '',
  email: '',
  primaryCar: null,
  isLoading: false,
  error: null,
  loadProfile: async (accessToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchProfile(accessToken);
      set({
        name: data.name,
        email: data.email,
        primaryCar: data.primaryCar,
        isLoading: false,
      });
    } catch (e) {
      set({
        isLoading: false,
        error: e instanceof Error ? e.message : '프로필을 불러오는데 실패했습니다.',
      });
    }
  },
  updateProfile: async (accessToken: string, request: UpdateProfileRequest) => {
    set({ isLoading: true, error: null });
    try {
      const data = await updateProfileApi(accessToken, request);
      set({
        name: data.name,
        email: data.email,
        primaryCar: data.primaryCar,
        isLoading: false,
      });
    } catch (e) {
      set({
        isLoading: false,
        error: e instanceof Error ? e.message : '프로필 수정에 실패했습니다.',
      });
      throw e;
    }
  },
  setProfile: (data) =>
    set((state) => ({
      ...state,
      ...data,
    })),
  clearProfile: () =>
    set({
      name: '',
      email: '',
      primaryCar: null,
      isLoading: false,
      error: null,
    }),
}));
