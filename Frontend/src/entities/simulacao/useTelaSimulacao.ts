import { useEffect, useMemo, useState } from "react";

import { ErroApi, simulacaoImpactoApi } from "@/api";
import { useAuth } from "@/entities/auth";
import { useStore } from "@/entities/store";
import {
  calcularParcelaMensal,
  parseNumero,
  round2,
  validarFormularioSimulacao,
} from "@/service/simulacao";
import type {
  CompensationSource,
  CompensationSourceType,
  ModoCompensacaoSimulacao,
  SimulationResult,
} from "@/types/flux";
import { gerarId, getDataAtual } from "@/utils/helpers";

interface FonteCompensacaoForm {
  id: string;
  tipoOrigem: CompensationSourceType;
  origemId: string;
  valorMensalDestinado: string;
}

export function useTelaSimulacao() {
  const { sessao } = useAuth();
  const token = sessao?.token ?? null;
  const { caixasCatalogo } = useStore();

  const [valorTotal, setValorTotal] = useState("");
  const [duracaoMeses, setDuracaoMeses] = useState("12");
  const [dataPrimeiroPagamento, setDataPrimeiroPagamento] = useState(getDataAtual());
  const [modoCompensacao, setModoCompensacao] =
    useState<ModoCompensacaoSimulacao>("nao-declarada");
  const [fontes, setFontes] = useState<FonteCompensacaoForm[]>([]);
  const [resultado, setResultado] = useState<SimulationResult | null>(null);
  const [erros, setErros] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(false);

  const fontesCompativeis = useMemo(
    () =>
      caixasCatalogo.filter(
        (caixa) => caixa.tipo === "orcamento" || caixa.tipo === "objetivo",
      ),
    [caixasCatalogo],
  );

  const parcelaMensal = useMemo(() => {
    return calcularParcelaMensal(valorTotal, duracaoMeses);
  }, [duracaoMeses, valorTotal]);

  const payload = useMemo(() => {
    const valorTotalNumero = parseNumero(valorTotal);
    const duracaoNumero = Math.floor(parseNumero(duracaoMeses));
    const fontesDeCompensacao: CompensationSource[] = fontes.map((fonte) => ({
      id: fonte.id,
      tipoOrigem: fonte.tipoOrigem,
      origemId: fonte.origemId,
      valorMensalDestinado: round2(parseNumero(fonte.valorMensalDestinado)),
    }));

    return {
      valorTotal: valorTotalNumero,
      duracaoMeses: duracaoNumero,
      dataPrimeiroPagamento,
      modoCompensacao,
      fontesDeCompensacao,
    };
  }, [dataPrimeiroPagamento, duracaoMeses, fontes, modoCompensacao, valorTotal]);

  useEffect(() => {
    const validacao = validarFormularioSimulacao(payload, parcelaMensal);
    setErros(validacao);

    if (!token || validacao.length > 0) {
      setCarregando(false);
      setResultado(null);
      return;
    }

    let cancelado = false;
    const timer = setTimeout(() => {
      setCarregando(true);
      simulacaoImpactoApi
        .simular(token, payload)
        .then((resposta) => {
          if (!cancelado) {
            setResultado(resposta);
            setErros([]);
          }
        })
        .catch((erro: unknown) => {
          if (cancelado) return;
          setResultado(null);
          setErros([resolverMensagemErro(erro)]);
        })
        .finally(() => {
          if (!cancelado) {
            setCarregando(false);
          }
        });
    }, 250);

    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [payload, parcelaMensal, token]);

  const adicionarFonte = () => {
    const primeiraFonte = fontesCompativeis[0];
    setFontes((estadoAtual) => [
      ...estadoAtual,
      {
        id: gerarId(),
        tipoOrigem: primeiraFonte?.tipo === "objetivo" ? "objetivo" : "orcamento",
        origemId: primeiraFonte?.id ?? "",
        valorMensalDestinado: "",
      },
    ]);
  };

  const removerFonte = (id: string) => {
    setFontes((estadoAtual) => estadoAtual.filter((fonte) => fonte.id !== id));
  };

  const atualizarFonte = (
    id: string,
    campo: keyof FonteCompensacaoForm,
    valor: string,
  ) => {
    setFontes((estadoAtual) =>
      estadoAtual.map((fonte) =>
        fonte.id === id ? { ...fonte, [campo]: valor } : fonte,
      ),
    );
  };

  return {
    valorTotal,
    setValorTotal,
    duracaoMeses,
    setDuracaoMeses,
    dataPrimeiroPagamento,
    setDataPrimeiroPagamento,
    modoCompensacao,
    setModoCompensacao,
    fontes,
    adicionarFonte,
    removerFonte,
    atualizarFonte,
    fontesCompativeis,
    parcelaMensal,
    resultado,
    erros,
    carregando,
  };
}

function resolverMensagemErro(erro: unknown): string {
  if (erro instanceof ErroApi) {
    if (typeof erro.payload === "object" && erro.payload !== null) {
      const payload = erro.payload as { message?: string };
      if (payload.message) return payload.message;
    }
    return "Não foi possível calcular a simulação.";
  }
  return "Não foi possível calcular a simulação.";
}
