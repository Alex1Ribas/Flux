import { useCallback, useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { useAuth } from "@/entities/auth";
import { useStore } from "@/entities/store";

import { useEstadoSincronizacaoFinance } from "./estadoSincronizacaoFinance";
import {
  cacheSincronizacaoExpirado,
  sincronizarDadosFinance,
} from "./hubSincronizacaoFinance";

export function SincronizadorFinanceApi() {
  const { sessao } = useAuth();
  const hidratarDadosRemotos = useStore((state) => state.hidratarDadosRemotos);
  const definirErro = useEstadoSincronizacaoFinance((state) => state.definirErro);
  const emAndamento = useRef(false);

  const sincronizar = useCallback(
    async (force = false) => {
      if (!sessao?.token || emAndamento.current) return;

      emAndamento.current = true;
      try {
        const dados = await sincronizarDadosFinance(sessao.token, { force });
        hidratarDadosRemotos(dados);
        definirErro(null);
      } catch {
        definirErro("Falha ao sincronizar dados. Toque para tentar de novo.");
      } finally {
        emAndamento.current = false;
      }
    },
    [definirErro, hidratarDadosRemotos, sessao]
  );

  useEffect(() => {
    if (!sessao?.token) {
      definirErro(null);
      return;
    }

    // Bootstrap leve: leitura com cache; sem materializar recorrentes.
    void sincronizar(false);

    const aoMudarEstado = (estado: AppStateStatus) => {
      if (estado === "active" && cacheSincronizacaoExpirado(sessao.token)) {
        void sincronizar(false);
      }
    };

    const subscricao = AppState.addEventListener("change", aoMudarEstado);
    return () => subscricao.remove();
  }, [sessao?.token, sincronizar, definirErro]);

  return null;
}

export function useRetrySincronizacaoFinance() {
  const { sessao } = useAuth();
  const hidratarDadosRemotos = useStore((state) => state.hidratarDadosRemotos);
  const definirErro = useEstadoSincronizacaoFinance((state) => state.definirErro);

  return useCallback(async () => {
    if (!sessao?.token) return;
    try {
      const dados = await sincronizarDadosFinance(sessao.token, {
        force: true,
        materializarRecorrentes: true,
      });
      hidratarDadosRemotos(dados);
      definirErro(null);
    } catch {
      definirErro("Falha ao sincronizar dados. Toque para tentar de novo.");
    }
  }, [definirErro, hidratarDadosRemotos, sessao?.token]);
}
