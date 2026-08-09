import { useCallback } from "react";

import { useAuth } from "@/entities/auth";
import { useStore } from "@/entities/store";

import {
  cacheSincronizacaoExpirado,
  invalidarCacheSincronizacaoFinance,
  sincronizarDadosFinance,
  type OpcoesSincronizacaoFinance,
} from "./hubSincronizacaoFinance";

export function useSincronizarRemoto() {
  const { sessao } = useAuth();
  const hidratarDadosRemotos = useStore((state) => state.hidratarDadosRemotos);

  const sincronizar = useCallback(
    async (opcoes: OpcoesSincronizacaoFinance = {}) => {
      if (!sessao?.token) return;

      const force = opcoes.force ?? true;
      if (force) {
        invalidarCacheSincronizacaoFinance();
      }

      const dados = await sincronizarDadosFinance(sessao.token, {
        ...opcoes,
        force,
      });
      hidratarDadosRemotos(dados);
    },
    [hidratarDadosRemotos, sessao]
  );

  const sincronizarSeExpirado = useCallback(async () => {
    if (!sessao?.token) return;
    if (!cacheSincronizacaoExpirado(sessao.token)) return;
    await sincronizar({ force: false });
  }, [sessao?.token, sincronizar]);

  return {
    token: sessao?.token,
    usuarioId: sessao?.usuarioId,
    sincronizar,
    sincronizarSeExpirado,
  };
}
