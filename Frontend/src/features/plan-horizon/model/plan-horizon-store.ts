import { create } from 'zustand';

export const HORIZON_PRESETS = [6, 12, 24] as const;
export const HORIZON_STEP = 6;
export const MAX_HORIZON = 60;

interface IPlanHorizonStore {
  months: number;
  setMonths: (months: number) => void;
  extend: () => void;
}

export const usePlanHorizonStore = create<IPlanHorizonStore>((set) => ({
  months: HORIZON_PRESETS[0],
  setMonths: (months) => set({ months: Math.min(MAX_HORIZON, Math.max(1, months)) }),
  extend: () =>
    set((state) => ({ months: Math.min(MAX_HORIZON, state.months + HORIZON_STEP) })),
}));
