import { create } from "zustand";

interface EstadoSincronizacaoFinance {
  erro: string | null;
  definirErro: (erro: string | null) => void;
}

export const useEstadoSincronizacaoFinance = create<EstadoSincronizacaoFinance>((set) => ({
  erro: null,
  definirErro: (erro) => set({ erro }),
}));
