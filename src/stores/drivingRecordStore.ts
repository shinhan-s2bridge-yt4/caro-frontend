import { create } from 'zustand';

import { getDrivingRecords, getDrivingSummary } from '@/services/drivingRecordService';
import type { DrivingRecord, DrivingSummary } from '@/types/drivingRecord';
import { getErrorMessage } from '@/utils/error';

type DrivingRecordState = {
  records: DrivingRecord[];
  yearMonth: string | null;
  nextCursor: number | null;
  hasNext: boolean;
  monthlyCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;

  // Summary 상태
  summary: DrivingSummary | null;
  isSummaryLoading: boolean;
  summaryError: string | null;

  setYearMonth: (yearMonth: string | null) => void;
  fetchRecords: (params: { yearMonth?: string }) => Promise<void>;
  fetchMoreRecords: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  reset: () => void;
};

export const useDrivingRecordStore = create<DrivingRecordState>((set, get) => ({
  records: [],
  yearMonth: null,
  nextCursor: null,
  hasNext: false,
  monthlyCount: 0,
  isLoading: false,
  isLoadingMore: false,
  error: null,

  // Summary 초기 상태
  summary: null,
  isSummaryLoading: false,
  summaryError: null,

  setYearMonth: (yearMonth) => set({ yearMonth }),

  fetchRecords: async ({ yearMonth }) => {
    set({ isLoading: true, error: null, yearMonth: yearMonth ?? null });
    try {
      const response = await getDrivingRecords({
        request: yearMonth ? { yearMonth } : {},
      });
      set({
        records: response.records,
        nextCursor: response.nextCursor,
        hasNext: response.hasNext,
        monthlyCount: response.monthlyCount,
        isLoading: false,
      });
    } catch (e) {
      const message = getErrorMessage(e, '운행 기록을 불러오는데 실패했습니다.');
      set({ error: message, isLoading: false });
    }
  },

  fetchMoreRecords: async () => {
    const { yearMonth, nextCursor, hasNext, isLoadingMore } = get();
    if (!hasNext || isLoadingMore || nextCursor === null) return;

    set({ isLoadingMore: true });
    try {
      const response = await getDrivingRecords({
        request: {
          ...(yearMonth && { yearMonth }),
          cursor: nextCursor,
        },
      });
      set((state) => ({
        records: [...state.records, ...response.records],
        nextCursor: response.nextCursor,
        hasNext: response.hasNext,
        isLoadingMore: false,
      }));
    } catch (e) {
      const message = getErrorMessage(e, '추가 기록을 불러오는데 실패했습니다.');
      set({ error: message, isLoadingMore: false });
    }
  },

  fetchSummary: async () => {
    set({ isSummaryLoading: true, summaryError: null });
    try {
      const summary = await getDrivingSummary();
      set({ summary, isSummaryLoading: false });
    } catch (e) {
      const message = getErrorMessage(e, '운행 요약 정보를 불러오는데 실패했습니다.');
      set({ summaryError: message, isSummaryLoading: false });
    }
  },

  reset: () =>
    set({
      records: [],
      yearMonth: null,
      nextCursor: null,
      hasNext: false,
      monthlyCount: 0,
      isLoading: false,
      isLoadingMore: false,
      error: null,
      summary: null,
      isSummaryLoading: false,
      summaryError: null,
    }),
}));
