import { useState } from "react";

import { lancamentosApi } from "@/api";
import { useSincronizarRemoto } from "@/entities/sincronizacao";
import { useStore } from "@/entities/store";
import {
  montarFormularioLancamentoAvulso,
  montarPayloadAtualizacaoAvulso,
  validarFormularioLancamentoAvulso,
  type FormularioLancamentoAvulso,
} from "@/service/acompanhamento";

const FORMULARIO_VAZIO: FormularioLancamentoAvulso = {
  valorTexto: "",
  descricao: "",
  competencia: "",
  caixaId: "",
  tipo: "saida",
};

export function useEditarLancamentoAvulso() {
  const { token, sincronizar } = useSincronizarRemoto();
  const { caixasCatalogo, lancamentos } = useStore();

  const [modalAberto, setModalAberto] = useState(false);
  const [lancamentoId, setLancamentoId] = useState<string | null>(null);
  const [formulario, setFormulario] = useState<FormularioLancamentoAvulso>(FORMULARIO_VAZIO);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const fecharModal = () => {
    setModalAberto(false);
    setLancamentoId(null);
    setFormulario(FORMULARIO_VAZIO);
    setErro("");
  };

  const abrirEditar = (impactoId: string) => {
    const lancamento = lancamentos.find((item) => item.id === impactoId);
    if (!lancamento || lancamento.recorrente) return;

    setLancamentoId(impactoId);
    setFormulario(montarFormularioLancamentoAvulso(lancamento));
    setErro("");
    setModalAberto(true);
  };

  const salvar = async (): Promise<boolean> => {
    if (!lancamentoId) return false;

    const erroValidacao = validarFormularioLancamentoAvulso(formulario);
    if (erroValidacao) {
      setErro(erroValidacao);
      return false;
    }

    if (!token) {
      setErro("Sessão expirada. Faça login novamente.");
      return false;
    }

    const lancamentoOriginal = lancamentos.find((item) => item.id === lancamentoId);
    if (!lancamentoOriginal || lancamentoOriginal.recorrente) {
      setErro("Lançamento não encontrado");
      return false;
    }

    setSalvando(true);
    try {
      const payload = montarPayloadAtualizacaoAvulso(formulario, lancamentoOriginal);
      await lancamentosApi.atualizar(token, lancamentoId, payload);
      await sincronizar();
      fecharModal();
      return true;
    } catch {
      setErro("Não foi possível salvar o lançamento na API");
      return false;
    } finally {
      setSalvando(false);
    }
  };

  const atualizarCampo = (campo: keyof FormularioLancamentoAvulso, valor: string) => {
    if (campo === "tipo") return;
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }));
    setErro("");
  };

  return {
    caixasCatalogo,
    modalAberto,
    formulario,
    erro,
    salvando,
    abrirEditar,
    fecharModal,
    salvar,
    atualizarCampo,
  };
}
