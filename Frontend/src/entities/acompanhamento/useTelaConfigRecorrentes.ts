import { useState } from "react";

import { useSincronizarRemoto } from "@/entities/sincronizacao";
import { useStore } from "@/entities/store";
import {
  atualizarItemRecorrenteComLancamentos,
  criarItemRecorrenteComLancamentos,
  excluirItemRecorrenteComLancamentos,
} from "@/service/inicio";
import {
  montarFormularioItemRecorrente,
  validarFormularioItemRecorrente,
  type FormularioItemRecorrente,
} from "@/service/acompanhamento";

export function useTelaConfigRecorrentes() {
  const { token, sincronizar } = useSincronizarRemoto();
  const { caixasCatalogo, itensRecorrentes, lancamentos } = useStore();
  const caixaPadrao = caixasCatalogo[0]?.id ?? "saldo_atual";

  const [modalAberto, setModalAberto] = useState(false);
  const [itemEditando, setItemEditando] = useState<string | null>(null);
  const [formulario, setFormulario] = useState<FormularioItemRecorrente>(
    montarFormularioItemRecorrente(null, caixaPadrao)
  );
  const [erro, setErro] = useState("");
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const fecharModal = () => {
    setModalAberto(false);
    setItemEditando(null);
    setErro("");
    setConfirmarExclusao(false);
  };

  const cancelarExclusao = () => setConfirmarExclusao(false);

  const abrirCriar = (preenchimento?: Partial<FormularioItemRecorrente>) => {
    setItemEditando(null);
    setFormulario({
      ...montarFormularioItemRecorrente(null, caixaPadrao),
      ...preenchimento,
    });
    setErro("");
    setModalAberto(true);
  };

  const abrirEditar = (itemId: string) => {
    const item = itensRecorrentes.find((itemRecorrente) => itemRecorrente.id === itemId);
    if (!item) return;
    setItemEditando(itemId);
    setFormulario(montarFormularioItemRecorrente(item, caixaPadrao));
    setErro("");
    setModalAberto(true);
  };

  const montarPayload = () => ({
    nome: formulario.nome.trim(),
    tipo: formulario.tipo,
    valor: Number(formulario.valorTexto),
    caixaId: formulario.caixaId,
    competenciaInicial: formulario.competenciaInicial,
    duracaoMeses: Number(formulario.duracaoMesesTexto),
    ativo: true,
  });

  const salvar = async (): Promise<string | null> => {
    const erroValidacao = validarFormularioItemRecorrente(
      formulario,
      itensRecorrentes,
      itemEditando
    );
    if (erroValidacao) {
      setErro(erroValidacao);
      return null;
    }

    if (!token) {
      setErro("Sessão expirada. Faça login novamente.");
      return null;
    }

    setSalvando(true);
    try {
      const payload = montarPayload();
      let idSalvo: string;
      if (itemEditando) {
        await atualizarItemRecorrenteComLancamentos(token, itemEditando, payload, lancamentos);
        idSalvo = itemEditando;
      } else {
        idSalvo = await criarItemRecorrenteComLancamentos(token, payload);
      }
      await sincronizar();
      fecharModal();
      return idSalvo;
    } catch {
      setErro("Não foi possível salvar o item recorrente na API");
      return null;
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExcluir = async () => {
    if (!itemEditando || !token) return;

    setSalvando(true);
    try {
      await excluirItemRecorrenteComLancamentos(token, itemEditando, lancamentos);
      await sincronizar();
      fecharModal();
    } catch {
      setErro("Não foi possível excluir o item recorrente na API");
    } finally {
      setSalvando(false);
    }
  };

  const atualizarCampo = (campo: keyof FormularioItemRecorrente, valor: string) => {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }));
    setErro("");
  };

  return {
    caixasCatalogo,
    itensRecorrentes,
    modalAberto,
    itemEditando,
    formulario,
    erro,
    confirmarExclusao,
    salvando,
    abrirCriar,
    abrirEditar,
    fecharModal,
    salvar,
    solicitarExclusao: () => setConfirmarExclusao(true),
    cancelarExclusao,
    confirmarExcluir,
    atualizarCampo,
  };
}
