import { useEffect, useMemo, useState } from "react";

import { contasApi } from "@/api";
import { useSincronizarRemoto } from "@/entities/sincronizacao";
import { useStore } from "@/entities/store";
import {
  filtrarContasPorStatus,
  montarFormularioConta,
  montarFormularioLiquidacao,
  montarPayloadConta,
  validarFormularioConta,
  validarFormularioLiquidacao,
  type FormularioConta,
  type FormularioLiquidacaoConta,
} from "@/service/contas";
import type { Conta, StatusConta } from "@/types/flux";

export function useTelaContas() {
  const { token, sincronizar } = useSincronizarRemoto();
  const { caixasCatalogo, contas } = useStore();
  const caixaPadrao = caixasCatalogo[0]?.id ?? "";

  useEffect(() => {
    if (!token) return;
    void sincronizar();
  }, [sincronizar, token]);

  const [filtroStatus, setFiltroStatus] = useState<StatusConta | "todas">("aberta");
  const [modalAberto, setModalAberto] = useState(false);
  const [modalLiquidarAberto, setModalLiquidarAberto] = useState(false);
  const [contaEditando, setContaEditando] = useState<string | null>(null);
  const [contaLiquidando, setContaLiquidando] = useState<Conta | null>(null);
  const [formulario, setFormulario] = useState<FormularioConta>(
    montarFormularioConta(null, caixaPadrao)
  );
  const [formularioLiquidacao, setFormularioLiquidacao] =
    useState<FormularioLiquidacaoConta>({
      liquidadoEm: "",
      caixaId: "",
    });
  const [erro, setErro] = useState("");
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const contasFiltradas = useMemo(
    () => filtrarContasPorStatus(contas, filtroStatus),
    [contas, filtroStatus]
  );

  const fecharModal = () => {
    setModalAberto(false);
    setContaEditando(null);
    setErro("");
    setConfirmarExclusao(false);
  };

  const fecharModalLiquidar = () => {
    setModalLiquidarAberto(false);
    setContaLiquidando(null);
    setErro("");
  };

  const abrirCriar = () => {
    setContaEditando(null);
    setFormulario(montarFormularioConta(null, caixaPadrao));
    setErro("");
    setModalAberto(true);
  };

  const abrirEditar = (contaId: string) => {
    const conta = contas.find((item) => item.id === contaId);
    if (!conta || conta.status !== "aberta") return;
    setContaEditando(contaId);
    setFormulario(montarFormularioConta(conta, caixaPadrao));
    setErro("");
    setModalAberto(true);
  };

  const abrirLiquidar = (contaId: string) => {
    const conta = contas.find((item) => item.id === contaId);
    if (!conta || conta.status !== "aberta") return;
    setContaLiquidando(conta);
    setFormularioLiquidacao(montarFormularioLiquidacao(conta));
    setErro("");
    setModalLiquidarAberto(true);
  };

  const salvar = async (): Promise<boolean> => {
    const erroValidacao = validarFormularioConta(formulario);
    if (erroValidacao) {
      setErro(erroValidacao);
      return false;
    }
    if (!token) {
      setErro("Sessão expirada. Faça login novamente.");
      return false;
    }

    setSalvando(true);
    try {
      const payload = montarPayloadConta(formulario);
      if (contaEditando) {
        await contasApi.atualizar(token, contaEditando, payload);
      } else {
        await contasApi.criar(token, payload);
      }
      await sincronizar();
      fecharModal();
      return true;
    } catch {
      setErro("Não foi possível salvar a conta.");
      return false;
    } finally {
      setSalvando(false);
    }
  };

  const liquidar = async (): Promise<boolean> => {
    if (!contaLiquidando) return false;
    const erroValidacao = validarFormularioLiquidacao(formularioLiquidacao);
    if (erroValidacao) {
      setErro(erroValidacao);
      return false;
    }
    if (!token) {
      setErro("Sessão expirada. Faça login novamente.");
      return false;
    }

    setSalvando(true);
    try {
      await contasApi.liquidar(token, contaLiquidando.id, {
        liquidadoEm: formularioLiquidacao.liquidadoEm,
        caixaId: formularioLiquidacao.caixaId,
      });
      await sincronizar();
      fecharModalLiquidar();
      return true;
    } catch {
      setErro("Não foi possível liquidar a conta.");
      return false;
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExcluir = async () => {
    if (!contaEditando || !token) return;
    setSalvando(true);
    try {
      await contasApi.excluir(token, contaEditando);
      await sincronizar();
      fecharModal();
    } catch {
      setErro("Não foi possível excluir a conta.");
    } finally {
      setSalvando(false);
    }
  };

  const atualizarCampo = (campo: keyof FormularioConta, valor: string) => {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }));
    setErro("");
  };

  const atualizarCampoLiquidacao = (
    campo: keyof FormularioLiquidacaoConta,
    valor: string
  ) => {
    setFormularioLiquidacao((anterior) => ({ ...anterior, [campo]: valor }));
    setErro("");
  };

  return {
    caixasCatalogo,
    contasFiltradas,
    filtroStatus,
    setFiltroStatus,
    modalAberto,
    modalLiquidarAberto,
    contaEditando,
    contaLiquidando,
    formulario,
    formularioLiquidacao,
    erro,
    confirmarExclusao,
    salvando,
    abrirCriar,
    abrirEditar,
    abrirLiquidar,
    fecharModal,
    fecharModalLiquidar,
    salvar,
    liquidar,
    solicitarExclusao: () => setConfirmarExclusao(true),
    cancelarExclusao: () => setConfirmarExclusao(false),
    confirmarExcluir,
    atualizarCampo,
    atualizarCampoLiquidacao,
  };
}
