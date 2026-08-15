import { useEffect, useState } from "react";

import { enviarMovimentacaoHomeNaApi } from "@/api";
import { useSincronizarRemoto } from "@/entities/sincronizacao";
import { useStore } from "@/entities/store";
import {
  calcEstouroOrcamento,
  derivarHorizonteDaData,
  listarUltimosLancamentosPresentes,
  montarMovimentacaoHome,
  validarMovimentacaoHome,
} from "@/service/inicio";
import { obterNomeCaixa, ordenarCaixasPorSaldo } from "@/shared/catalogoCaixas";
import type { CaixaId } from "@/shared/estilosCaixa";
import type { CaixaCatalogoItem, Caixas } from "@/types/flux";
import { getDataAtual, getMesAtual, getMesDeCompetencia } from "@/utils/helpers";

export interface ParametrosHome {
  modoInicial?: "entrada" | "saida";
  horizonteInicial?: "presente" | "futuro";
  caixaInicial?: CaixaId;
}


function filtrarCaixasPorModo(
  catalogo: CaixaCatalogoItem[],
  modo: "entrada" | "saida",
  papel: "selecao" | "destino",
): CaixaCatalogoItem[] {
  if (modo === "entrada" && papel === "selecao") {
    return catalogo.filter((caixa) => caixa.tipo === "origem");
  }
  if (modo === "entrada" && papel === "destino") {
    return catalogo.filter((caixa) => caixa.tipo !== "origem");
  }
  return catalogo.filter((caixa) => caixa.tipo !== "origem");
}

function obterCaixaPadrao(
  caixasCatalogo: CaixaCatalogoItem[],
  caixas: Caixas,
  caixaInicial?: CaixaId
): CaixaId {
  if (caixaInicial && caixasCatalogo.some((caixa) => caixa.id === caixaInicial)) {
    return caixaInicial;
  }
  const ordenadas = ordenarCaixasPorSaldo(caixasCatalogo, caixas);
  return ordenadas[0]?.id ?? "";
}

export function useTelaInicio({
  modoInicial = "entrada",
  horizonteInicial = "presente",
  caixaInicial,
}: ParametrosHome) {
  const { token, sincronizar } = useSincronizarRemoto();
  const {
    caixas,
    caixasCatalogo,
    lancamentos,
    orcamentos,
  } = useStore();

  const hoje = getDataAtual();
  const dataInicial =
    horizonteInicial === "futuro"
      ? (() => {
          const [ano, mes, dia] = hoje.split("-").map(Number);
          const seguinte = new Date(ano, mes - 1, dia + 1);
          return `${seguinte.getFullYear()}-${String(seguinte.getMonth() + 1).padStart(2, "0")}-${String(seguinte.getDate()).padStart(2, "0")}`;
        })()
      : hoje;

  const [caixaSelecionada, setCaixaSelecionada] = useState<CaixaId>(() =>
    obterCaixaPadrao(caixasCatalogo, caixas, caixaInicial)
  );
  const [caixaDestino, setCaixaDestino] = useState<CaixaId>("");
  const [modo, setModo] = useState<"entrada" | "saida">(modoInicial);
  const [dataLancamento, setDataLancamento] = useState(dataInicial);
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("");
  const [recorrente, setRecorrente] = useState(false);
  const [caixaCompensacao, setCaixaCompensacao] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const catalogoSelecao = filtrarCaixasPorModo(caixasCatalogo, modo, "selecao");
    if (catalogoSelecao.length === 0) return;
    const existeSelecionada = catalogoSelecao.some((caixa) => caixa.id === caixaSelecionada);
    if (!existeSelecionada) {
      setCaixaSelecionada(obterCaixaPadrao(catalogoSelecao, caixas, caixaInicial));
    }
    if (modo === "entrada") {
      const catalogoDestino = filtrarCaixasPorModo(caixasCatalogo, modo, "destino");
      const existeDestino = catalogoDestino.some((caixa) => caixa.id === caixaDestino);
      if (!existeDestino) {
        setCaixaDestino(catalogoDestino[0]?.id ?? "");
      }
    }
  }, [caixasCatalogo, caixas, caixaInicial, caixaSelecionada, caixaDestino, modo]);

  const horizonte = derivarHorizonteDaData(dataLancamento, hoje);
  const valorNum = Number(valor) || 0;
  const mesAtual = getMesAtual();
  const mesCompetencia = getMesDeCompetencia(dataLancamento);
  const orcamentoCaixa = orcamentos[mesCompetencia]?.[caixaSelecionada] || 0;
  const estouroOrcamento = calcEstouroOrcamento(modo, horizonte, valorNum, orcamentoCaixa);
  const ultimosLancamentos = listarUltimosLancamentosPresentes(lancamentos, mesAtual, 2);

  const limparFormulario = () => {
    setValor("");
    setTipo("");
    setRecorrente(false);
    setCaixaCompensacao("");
    setErro("");
  };

  const registrar = async () => {
    if (!token) {
      setErro("Sessão expirada. Faça login novamente.");
      return;
    }

    const input = montarMovimentacaoHome({
      modo,
      horizonte,
      valor: valorNum,
      tipo,
      competencia: dataLancamento,
      caixaSelecionada,
      caixaDestino: modo === "entrada" ? caixaDestino : undefined,
      caixaCompensacao,
      orcamentoCaixa,
      recorrente,
      competenciaInicial: recorrente ? dataLancamento : undefined,
      duracaoMeses: recorrente ? 12 : undefined,
    });

    const estouro = calcEstouroOrcamento(
      input.modo,
      input.horizonte,
      input.valor,
      input.orcamentoCaixa
    );
    const erroValidacao = validarMovimentacaoHome(input, estouro);
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    setSalvando(true);
    try {
      await enviarMovimentacaoHomeNaApi(token, input);
      await sincronizar();
      limparFormulario();
    } catch {
      setErro("Não foi possível registrar a movimentação na API");
    } finally {
      setSalvando(false);
    }
  };

  const selecionarMotivo = (motivo: string) => {
    setTipo(motivo);
    setErro("");
  };

  const nomeCaixaSelecionada = obterNomeCaixa(caixasCatalogo, caixaSelecionada);

  const catalogoSelecao = filtrarCaixasPorModo(caixasCatalogo, modo, "selecao");
  const catalogoDestino = filtrarCaixasPorModo(caixasCatalogo, modo, "destino");
  const nomeCaixaDestino = obterNomeCaixa(caixasCatalogo, caixaDestino);

  return {
    caixas,
    caixasCatalogo,
    catalogoSelecao,
    catalogoDestino,
    caixaSelecionada,
    setCaixaSelecionada,
    caixaDestino,
    setCaixaDestino,
    nomeCaixaSelecionada,
    nomeCaixaDestino,
    modo,
    setModo,
    horizonte,
    dataLancamento,
    setDataLancamento,
    valor,
    setValor,
    valorNum,
    tipo,
    recorrente,
    setRecorrente,
    caixaCompensacao,
    setCaixaCompensacao,
    erro,
    salvando,
    token,
    ultimosLancamentos,
    precisaCompensacao: estouroOrcamento.precisaCompensacao,
    estouro: estouroOrcamento.estouro,
    modoLabel: modo === "entrada" ? "Entrada" : "Saída",
    registrar,
    selecionarMotivo,
  };
}
