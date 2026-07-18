import { useMemo, useState } from "react";

import { caixasApi } from "@/api";
import { useSincronizarRemoto } from "@/entities/sincronizacao";
import { useStore } from "@/entities/store";
import {
  calcularLimitesOrcamento,
  calcularPreviewPrazo,
  montarFormularioCaixa,
  validarExclusaoCaixa,
  validarFormularioCaixa,
  type FormularioCaixaInput,
} from "@/service/caixas";
import type { TipoCaixa } from "@/types/flux";
import { getMesAtual } from "@/utils/helpers";

export function useTelaCaixas() {
  const { token, sincronizar } = useSincronizarRemoto();
  const { caixasCatalogo, caixas, orcamentos, lancamentos } = useStore();

  const competencia = getMesAtual();
  const [modalAberto, setModalAberto] = useState(false);
  const [caixaEditando, setCaixaEditando] = useState<string | null>(null);
  const [formulario, setFormulario] = useState<FormularioCaixaInput>(
    montarFormularioCaixa(null, caixasCatalogo, caixas, orcamentos, competencia)
  );
  const [erro, setErro] = useState("");
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const prazoEstimado = useMemo(() => calcularPreviewPrazo(formulario), [formulario]);
  const limitesOrcamento = useMemo(() => {
    if (formulario.tipo !== "orcamento") return null;
    return calcularLimitesOrcamento(Number(formulario.orcamentoMensalTexto) || 0, competencia);
  }, [competencia, formulario.orcamentoMensalTexto, formulario.tipo]);

  const abrirCriar = () => {
    setCaixaEditando(null);
    setFormulario(montarFormularioCaixa(null, caixasCatalogo, caixas, orcamentos, competencia));
    setErro("");
    setModalAberto(true);
  };

  const abrirEditar = (caixaId: string) => {
    setCaixaEditando(caixaId);
    setFormulario(montarFormularioCaixa(caixaId, caixasCatalogo, caixas, orcamentos, competencia));
    setErro("");
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setCaixaEditando(null);
    setErro("");
    setConfirmarExclusao(false);
  };

  const salvar = async () => {
    const erroValidacao = validarFormularioCaixa(formulario, caixasCatalogo, caixaEditando);
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    if (!token) {
      setErro("Sessão expirada. Faça login novamente.");
      return;
    }

    setSalvando(true);
    try {
      const payloadBase = {
        nome: formulario.nome.trim(),
        saldo: Number(formulario.saldoTexto) || 0,
        tipo: formulario.tipo,
        meta:
          formulario.tipo === "objetivo" ? Number(formulario.metaTexto) || undefined : undefined,
        aporteMensal:
          formulario.tipo === "objetivo"
            ? Number(formulario.aporteMensalTexto) || undefined
            : undefined,
        orcamentoMensal:
          formulario.tipo === "orcamento"
            ? Number(formulario.orcamentoMensalTexto) || undefined
            : undefined,
      };

      if (caixaEditando) {
        await caixasApi.atualizar(token, caixaEditando, payloadBase);
      } else {
        await caixasApi.criar(token, payloadBase);
      }

      await sincronizar();
      fecharModal();
    } catch {
      setErro("Não foi possível salvar a caixa na API");
    } finally {
      setSalvando(false);
    }
  };

  const solicitarExclusao = () => setConfirmarExclusao(true);

  const confirmarExcluir = async () => {
    if (!caixaEditando) return;

    const erroExclusao = validarExclusaoCaixa(caixaEditando, caixasCatalogo, lancamentos);
    if (erroExclusao) {
      setErro(erroExclusao);
      setConfirmarExclusao(false);
      return;
    }

    if (!token) {
      setErro("Sessão expirada. Faça login novamente.");
      return;
    }

    setSalvando(true);
    try {
      await caixasApi.excluir(token, caixaEditando);
      await sincronizar();
      fecharModal();
    } catch {
      setErro("Não foi possível excluir a caixa na API");
    } finally {
      setSalvando(false);
    }
  };

  const atualizarCampo = (campo: keyof FormularioCaixaInput, valor: string) => {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }));
    setErro("");
  };

  const definirTipo = (tipo: TipoCaixa) => {
    setFormulario((anterior) => ({ ...anterior, tipo }));
    setErro("");
  };

  return {
    caixasCatalogo,
    caixas,
    orcamentos,
    competencia,
    modalAberto,
    caixaEditando,
    formulario,
    erro,
    confirmarExclusao,
    salvando,
    prazoEstimado,
    limitesOrcamento,
    abrirCriar,
    abrirEditar,
    fecharModal,
    salvar,
    solicitarExclusao,
    cancelarExclusao: () => setConfirmarExclusao(false),
    confirmarExcluir,
    atualizarCampo,
    definirTipo,
  };
}
