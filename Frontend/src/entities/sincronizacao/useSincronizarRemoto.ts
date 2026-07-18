import { useCallback } from "react";

import { useAuth } from "@/entities/auth";
import { useStore } from "@/entities/store";

import { carregarDadosFinanceApi } from "./carregarDadosFinanceApi";

export function useSincronizarRemoto() {
  const { sessao } = useAuth();
  const hidratarDadosRemotos = useStore((state) => state.hidratarDadosRemotos);

  const sincronizar = useCallback(async () => {
    if (!sessao?.token) return;

    const dados = await carregarDadosFinanceApi(sessao.token);
    hidratarDadosRemotos(dados);
  }, [hidratarDadosRemotos, sessao]);

  return {
    token: sessao?.token,
    usuarioId: sessao?.usuarioId,
    sincronizar,
  };
}
