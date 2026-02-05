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

type SignupDraftState = {
  account: SignupAccountDraft | null;
  vehicle: SignupVehicleDraft;
  setAccount: (account: SignupAccountDraft) => void;
  updateVehicle: (patch: Partial<SignupVehicleDraft>) => void;
  clearDraft: () => void;
};

const initialVehicle: SignupVehicleDraft = {};

export const useSignupDraftStore = create<SignupDraftState>((set) => ({
  account: null,
  vehicle: initialVehicle,
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
      account: null,
      vehicle: initialVehicle,
    }),
}));

