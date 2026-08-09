import { useCallback, useEffect, useState } from "react";

import { CONTAS_PAGE_SIZE, contasApi } from "@/api";
import { useSincronizarRemoto } from "@/entities/sincronizacao";
import { useStore } from "@/entities/store";
import {
  montarFormularioConta,
  montarFormularioLiquidacao,
  montarPayloadConta,
  validarFormularioConta,
  validarFormularioLiquidacao,
  type FormularioConta,
  type FormularioLiquidacaoConta,
} from "@/service/contas";
import type { Conta, StatusConta, TipoConta } from "@/types/flux";
import { mapearContaApi } from "./mapearContaApi";

export function useTelaContas() {
  const { token, sincronizar } = useSincronizarRemoto();
  const { caixasCatalogo } = useStore();
  const caixaPadrao = caixasCatalogo[0]?.id ?? "";

  const [filtroTipo, setFiltroTipo] = useState<TipoConta>("a_pagar");
  const [filtroStatus, setFiltroStatus] = useState<StatusConta | "todas">("aberta");
  const [contasFiltradas, setContasFiltradas] = useState<Conta[]>([]);
  const [lastItemId, setLastItemId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [carregandoLista, setCarregandoLista] = useState(false);
  const [carregandoMais, setCarregandoMais] = useState(false);

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

  const carregarPagina = useCallback(
    async (cursor: string | undefined, acumular: boolean) => {
      if (!token) return;

      if (acumular) setCarregandoMais(true);
      else setCarregandoLista(true);

      try {
        let statusFiltro: StatusConta | undefined;
        if (filtroStatus !== "todas") {
          statusFiltro = filtroStatus;
        }

        const resposta = await contasApi.listar(token, {
          tipo: filtroTipo,
          status: statusFiltro,
          pageSize: CONTAS_PAGE_SIZE,
          lastItemId: cursor,
        });
        const mapeadas = resposta.items.map(mapearContaApi);
        setContasFiltradas((anteriores) => {
          if (acumular) {
            return [...anteriores, ...mapeadas];
          }
          return mapeadas;
        });
        setLastItemId(resposta.lastItemId);
        setHasMore(resposta.hasMore);
        setTotal(resposta.total);
      } catch {
        setErro("Não foi possível carregar as contas.");
      } finally {
        setCarregandoLista(false);
        setCarregandoMais(false);
      }
    },
    [filtroStatus, filtroTipo, token]
  );

  useEffect(() => {
    void carregarPagina(undefined, false);
  }, [carregarPagina]);

  const carregarMais = () => {
    if (!hasMore || !lastItemId || carregandoMais || carregandoLista) return;
    void carregarPagina(lastItemId, true);
  };

  const recarregarLista = async () => {
    await sincronizar({ force: true });
    await carregarPagina(undefined, false);
  };

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
    setFormulario({
      ...montarFormularioConta(null, caixaPadrao),
      tipo: filtroTipo,
    });
    setErro("");
    setModalAberto(true);
  };

  const abrirEditar = (contaId: string) => {
    const conta = contasFiltradas.find((item) => item.id === contaId);
    if (!conta || conta.status !== "aberta") return;
    setContaEditando(contaId);
    setFormulario(montarFormularioConta(conta, caixaPadrao));
    setErro("");
    setModalAberto(true);
  };

  const abrirLiquidar = (contaId: string) => {
    const conta = contasFiltradas.find((item) => item.id === contaId);
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
      await recarregarLista();
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
      await recarregarLista();
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
      await recarregarLista();
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
    filtroTipo,
    setFiltroTipo,
    filtroStatus,
    setFiltroStatus,
    hasMore,
    total,
    carregandoLista,
    carregandoMais,
    carregarMais,
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
