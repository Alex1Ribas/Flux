import { useCallback, useEffect, useState } from "react";

import { acompanhamentoApi } from "@/api";
import { useAuth } from "@/entities/auth";
import { LIMITES_RISCO_PADRAO } from "@/shared/limitesRisco";
import type { AcompanhamentoMes } from "@/types/flux";
import { getMesAtual } from "@/utils/helpers";

const ACOMPANHAMENTO_VAZIO: AcompanhamentoMes = {
  competencia: getMesAtual(),
  risco: { entradaPrevista: 0, comprometido: 0, risco: 0 },
  riscoReal: { entradaPrevista: 0, comprometido: 0, risco: 0 },
  diferencial: 0,
  diferencialValor: 0,
  status: "saudavel",
  dentroPlanejado: true,
  limites: LIMITES_RISCO_PADRAO,
  evolucao: [],
  compromissos: [],
  composicao: [],
  impactos: [],
};

export function useAcompanhamentoApi(competencia: string) {
  const { sessao } = useAuth();
  const token = sessao?.token;
  const [dados, setDados] = useState<AcompanhamentoMes>({
    ...ACOMPANHAMENTO_VAZIO,
    competencia,
  });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [geracao, setGeracao] = useState(0);

  const recarregar = useCallback(() => {
    setGeracao((atual) => atual + 1);
  }, []);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      if (!token) {
        if (!cancelado) {
          setDados({ ...ACOMPANHAMENTO_VAZIO, competencia });
          setCarregando(false);
          setErro(null);
        }
        return;
      }

      setCarregando(true);
      setErro(null);
      try {
        const resposta = await acompanhamentoApi.obter(token, competencia);
        if (!cancelado) {
          setDados(resposta);
        }
      } catch {
        if (!cancelado) {
          setErro("Não foi possível carregar o acompanhamento.");
          setDados({ ...ACOMPANHAMENTO_VAZIO, competencia });
        }
      } finally {
        if (!cancelado) {
          setCarregando(false);
        }
      }
    }

    void carregar();
    return () => {
      cancelado = true;
    };
  }, [token, competencia, geracao]);

  return {
    dados,
    carregando,
    erro,
    recarregar,
  };
}
