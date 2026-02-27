import { create } from 'zustand';
import { fetchMyCars } from '@/services/vehicleService';
import type { PrimaryCar } from '@/types/profile';
import { getErrorMessage } from '@/utils/error';

type MyCarState = {
  cars: PrimaryCar[];
  isLoading: boolean;
  error: string | null;
  loadMyCars: () => Promise<void>;
  clearCars: () => void;
};

export const useMyCarStore = create<MyCarState>((set) => ({
  cars: [],
  isLoading: false,
  error: null,
  loadMyCars: async () => {
    set({ isLoading: true, error: null });
    try {
      const cars = await fetchMyCars();
      set({ cars, isLoading: false });
    } catch (e) {
      set({
        isLoading: false,
        error: getErrorMessage(e, '차량 목록을 불러오는데 실패했습니다.'),
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
