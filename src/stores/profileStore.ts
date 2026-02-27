import { create } from 'zustand';
import { fetchProfile, updateProfile as updateProfileApi } from '@/services/profileService';
import type { UpdateProfileRequest } from '@/services/profileService';
import type { ProfileData, PrimaryCar } from '@/types/profile';
import { getErrorMessage } from '@/utils/error';

type ProfileState = {
  name: string;
  email: string;
  primaryCar: PrimaryCar | null;
  isLoading: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  updateProfile: (request: UpdateProfileRequest) => Promise<void>;
  setProfile: (data: Partial<ProfileData>) => void;
  clearProfile: () => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  name: '',
  email: '',
  primaryCar: null,
  isLoading: false,
  error: null,
  loadProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchProfile();
      set({
        name: data.name,
        email: data.email,
        primaryCar: data.primaryCar,
        isLoading: false,
      });
    } catch (e) {
      set({
        isLoading: false,
        error: getErrorMessage(e, '프로필을 불러오는데 실패했습니다.'),
      });
    }
  },
  updateProfile: async (request: UpdateProfileRequest) => {
    set({ isLoading: true, error: null });
    try {
      const data = await updateProfileApi(request);
      set({
        name: data.name,
        email: data.email,
        primaryCar: data.primaryCar,
        isLoading: false,
      });
    } catch (e) {
      set({
        isLoading: false,
        error: getErrorMessage(e, '프로필 수정에 실패했습니다.'),
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
