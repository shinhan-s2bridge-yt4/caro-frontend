import { create } from 'zustand';
import { fetchMyCars } from '@/services/vehicleService';
import type { PrimaryCar } from '@/types/profile';

type MyCarState = {
  cars: PrimaryCar[];
  isLoading: boolean;
  error: string | null;
  loadMyCars: (accessToken: string) => Promise<void>;
  clearCars: () => void;
};

export const useMyCarStore = create<MyCarState>((set) => ({
  cars: [],
  isLoading: false,
  error: null,
  loadMyCars: async (accessToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const cars = await fetchMyCars(accessToken);
      set({ cars, isLoading: false });
    } catch (e) {
      set({
        isLoading: false,
        error: e instanceof Error ? e.message : '차량 목록을 불러오는데 실패했습니다.',
      });
    }
  },
  clearCars: () =>
    set({
      cars: [],
      isLoading: false,
      error: null,
    }),
}));
