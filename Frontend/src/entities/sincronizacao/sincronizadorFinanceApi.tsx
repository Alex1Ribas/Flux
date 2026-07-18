import { useCallback, useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { useAuth } from "@/entities/auth";
import { useStore } from "@/entities/store";

import { carregarDadosFinanceApi } from "./carregarDadosFinanceApi";

export function SincronizadorFinanceApi() {
  const { sessao } = useAuth();
  const hidratarDadosRemotos = useStore((state) => state.hidratarDadosRemotos);
  const emAndamento = useRef(false);

  const sincronizar = useCallback(async () => {
    if (!sessao?.token || emAndamento.current) return;

    emAndamento.current = true;
    try {
      const dados = await carregarDadosFinanceApi(sessao.token);
      hidratarDadosRemotos(dados);
    } catch {
      // Mantém o estado local se a sincronização falhar.
    } finally {
      emAndamento.current = false;
    }
  }, [hidratarDadosRemotos, sessao]);

  useEffect(() => {
    if (!sessao?.token) return;

    void sincronizar();

    const aoMudarEstado = (estado: AppStateStatus) => {
      if (estado === "active") {
        void sincronizar();
      }
    };

    const subscricao = AppState.addEventListener("change", aoMudarEstado);
    return () => subscricao.remove();
  }, [sessao?.token, sincronizar]);

  return null;
}
