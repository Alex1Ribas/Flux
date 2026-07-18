import { useState } from "react";

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
import type { CaixaId } from "@/shared/estilosCaixa";
import type { TipoRecorrencia } from "@/types/flux";
import { getDataAtual, getMesAtual, getMesDeCompetencia } from "@/utils/helpers";

export interface ParametrosHome {
  modoInicial?: "entrada" | "saida";
  horizonteInicial?: "presente" | "futuro";
  caixaInicial?: CaixaId;
}

export function useTelaInicio({
  modoInicial = "entrada",
  horizonteInicial = "presente",
  caixaInicial = "saldo_atual",
}: ParametrosHome) {
  const { token, sincronizar } = useSincronizarRemoto();
  const {
    caixas,
    caixasCatalogo,
    lancamentos,
    orcamentos,
  } = useStore();

  const caixaPadrao =
    caixasCatalogo.find((caixa) => caixa.id === caixaInicial)?.id ??
    caixasCatalogo[0]?.id ??
    "saldo_atual";

  const hoje = getDataAtual();
  const dataInicial =
    horizonteInicial === "futuro"
      ? (() => {
          const [ano, mes, dia] = hoje.split("-").map(Number);
          const seguinte = new Date(ano, mes - 1, dia + 1);
          return `${seguinte.getFullYear()}-${String(seguinte.getMonth() + 1).padStart(2, "0")}-${String(seguinte.getDate()).padStart(2, "0")}`;
        })()
      : hoje;

  const [caixaSelecionada, setCaixaSelecionada] = useState<CaixaId>(caixaPadrao);
  const [modo, setModo] = useState<"entrada" | "saida">(modoInicial);
  const [dataLancamento, setDataLancamento] = useState(dataInicial);
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("");
  const [recorrente, setRecorrente] = useState(false);
  const [parcelamentoAtivo, setParcelamentoAtivo] = useState(false);
  const [tipoRecorrencia, setTipoRecorrencia] = useState<TipoRecorrencia>("dividir");
  const [parcelas, setParcelas] = useState("12");
  const [caixaCompensacao, setCaixaCompensacao] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

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
    setParcelamentoAtivo(false);
    setTipoRecorrencia("dividir");
    setParcelas("12");
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
      caixaCompensacao,
      orcamentoCaixa,
      parcelamentoAtivo,
      tipoRecorrencia: tipoRecorrencia === "cheio" ? "cheio" : "dividir",
      parcelas,
      recorrente,
      competenciaInicial: recorrente ? mesCompetencia : undefined,
      duracaoMeses: recorrente ? Math.max(1, Number(parcelas) || 12) : undefined,
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

  return {
    caixas,
    caixasCatalogo,
    caixaSelecionada,
    setCaixaSelecionada,
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
    parcelamentoAtivo,
    setParcelamentoAtivo,
    tipoRecorrencia,
    setTipoRecorrencia,
    parcelas,
    setParcelas,
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
