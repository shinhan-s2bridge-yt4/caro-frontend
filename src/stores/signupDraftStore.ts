import { create } from 'zustand';

type SignupAccountDraft = {
  name: string;
  email: string;
  password: string;
};

type SignupVehicleDraft = {
  brandId?: number;
  brandName?: string;
  modelId?: number;
  modelName?: string;
  modelVariant?: string;
  modelStartYear?: number;
  modelEndYear?: number;
  registrationNumber?: string;
  mileage?: number;
};

// 플로우 모드: signup(회원가입), add-vehicle(마이페이지에서 차량 추가)
type FlowMode = 'signup' | 'add-vehicle';

type SignupDraftState = {
  mode: FlowMode;
  account: SignupAccountDraft | null;
  vehicle: SignupVehicleDraft;
  setMode: (mode: FlowMode) => void;
  setAccount: (account: SignupAccountDraft) => void;
  updateVehicle: (patch: Partial<SignupVehicleDraft>) => void;
  clearDraft: () => void;
};

const initialVehicle: SignupVehicleDraft = {};

export const useSignupDraftStore = create<SignupDraftState>((set) => ({
  mode: 'signup',
  account: null,
  vehicle: initialVehicle,
  setMode: (mode) => set({ mode }),
  setAccount: (account) => set({ account }),
  updateVehicle: (patch) =>
    set((s) => ({
      vehicle: {
        ...s.vehicle,
        ...patch,
      },
    })),
  clearDraft: () =>
    set({
      mode: 'signup',
      account: null,
      vehicle: initialVehicle,
    }),
}));

