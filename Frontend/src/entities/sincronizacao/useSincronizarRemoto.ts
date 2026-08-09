import { useCallback } from "react";

import { useAuth } from "@/entities/auth";
import { useStore } from "@/entities/store";

import {
  invalidarCacheSincronizacaoFinance,
  sincronizarDadosFinance,
} from "./hubSincronizacaoFinance";

export function useSincronizarRemoto() {
  const { sessao } = useAuth();
  const hidratarDadosRemotos = useStore((state) => state.hidratarDadosRemotos);

  const sincronizar = useCallback(
    async (opcoes: { force?: boolean } = {}) => {
      if (!sessao?.token) return;

      const force = opcoes.force ?? true;
      if (force) {
        invalidarCacheSincronizacaoFinance();
      }

      const dados = await sincronizarDadosFinance(sessao.token, { force });
      hidratarDadosRemotos(dados);
    },
    [hidratarDadosRemotos, sessao]
  );

  return {
    token: sessao?.token,
    usuarioId: sessao?.usuarioId,
    sincronizar,
  };
}
