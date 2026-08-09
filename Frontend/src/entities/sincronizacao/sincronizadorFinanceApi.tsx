import { useCallback, useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { useAuth } from "@/entities/auth";
import { useStore } from "@/entities/store";

import { sincronizarDadosFinance } from "./hubSincronizacaoFinance";

export function SincronizadorFinanceApi() {
  const { sessao } = useAuth();
  const hidratarDadosRemotos = useStore((state) => state.hidratarDadosRemotos);
  const emAndamento = useRef(false);

  const sincronizar = useCallback(
    async (force = false) => {
      if (!sessao?.token || emAndamento.current) return;

      emAndamento.current = true;
      try {
        const dados = await sincronizarDadosFinance(sessao.token, { force });
        hidratarDadosRemotos(dados);
      } catch {
        // Mantém o estado local se a sincronização falhar.
      } finally {
        emAndamento.current = false;
      }
    },
    [hidratarDadosRemotos, sessao]
  );

  useEffect(() => {
    if (!sessao?.token) return;

    void sincronizar(true);

    const aoMudarEstado = (estado: AppStateStatus) => {
      if (estado === "active") {
        void sincronizar(false);
      }
    };

    const subscricao = AppState.addEventListener("change", aoMudarEstado);
    return () => subscricao.remove();
  }, [sessao?.token, sincronizar]);

  return null;
}
