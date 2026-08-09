import { useEffect } from "react";
import {
  BackHandler,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { ModalFormularioConta, ModalLiquidarConta } from "@/components/contas";
import { useTelaContas } from "@/entities/contas";
import {
  Cartao,
  ModalConfirmacao,
} from "@/shared/components";
import { obterNomeCaixa } from "@/shared/catalogoCaixas";
import { Plus } from "@/shared/icons";
import { useFundoTela } from "@/shared/estiloSuperficie";
import { useCores } from "@/shared/tema";
import { MARCA } from "@/shared/tokensDesign";
import { rotuloStatusConta, rotuloTipoConta } from "@/service/contas";
import type { TelaProps } from "@/types/navigation";
import { formatBRL, formatarCompetencia } from "@/utils/helpers";

export function TelaContas(_props: TelaProps) {
  const contas = useTelaContas();
  const cores = useCores();
  const fundo = useFundoTela();

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (contas.confirmarExclusao) {
        contas.cancelarExclusao();
        return true;
      }
      if (contas.modalLiquidarAberto) {
        contas.fecharModalLiquidar();
        return true;
      }
      if (contas.modalAberto) {
        contas.fecharModal();
        return true;
      }
      return false;
    });

    return () => subscription.remove();
  }, [contas]);

  return (
    <>
      <View
        className="flex-1"
        style={{ backgroundColor: fundo }}
      >
        <ScrollView
          contentContainerClassName="p-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={contas.atualizando}
              onRefresh={() => {
                void contas.atualizarPorGesto();
              }}
              tintColor={cores.primary}
              colors={[cores.primary]}
            />
          }
        >
          <View className="mb-4 mt-1">
            <Text
              className="text-sm font-semibold uppercase tracking-wide mb-1"
              style={{ color: cores.primary }}
            >
              {MARCA}
            </Text>
            <Text className="text-text text-4xl font-medium">Contas</Text>
            <Text className="text-textMuted text-md mt-1 leading-4">
              Ocorrências a pagar e a receber. Recorrentes são a regra; cada Conta liquida
              sozinha — inclusive antecipada.
            </Text>
          </View>

          <View className="flex-row gap-2 mb-3">
            {(
              [
                { id: "a_pagar" as const, label: "A pagar" },
                { id: "a_receber" as const, label: "A receber" },
              ]
            ).map((filtro) => {
              let backgroundColor = cores.surface;
              if (contas.filtroTipo === filtro.id) {
                backgroundColor = cores.primaryHighlight;
              }
              return (
                <Pressable
                  key={filtro.id}
                  onPress={() => contas.setFiltroTipo(filtro.id)}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-border items-center"
                  style={{ backgroundColor }}
                >
                  <Text className="text-text text-xs font-semibold">{filtro.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View className="flex-row gap-2 mb-3">
            {(
              [
                { id: "aberta", label: "Abertas" },
                { id: "liquidada", label: "Liquidadas" },
                { id: "todas", label: "Todas" },
              ] as const
            ).map((filtro) => {
              let backgroundColor = cores.surface;
              if (contas.filtroStatus === filtro.id) {
                backgroundColor = cores.primaryHighlight;
              }
              return (
                <Pressable
                  key={filtro.id}
                  onPress={() => contas.setFiltroStatus(filtro.id)}
                  className="px-3 py-2 rounded-xl border border-border"
                  style={{ backgroundColor }}
                >
                  <Text className="text-text text-xs font-medium">{filtro.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-textMuted text-[11px]">
              {textoContagemLista(contas.carregandoLista, contas.contasFiltradas.length, contas.total)}
            </Text>
            <Pressable
              onPress={contas.abrirCriar}
              className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface"
            >
              <Plus
                size={16}
                color={cores.text}
              />
              <Text className="text-text text-xs font-medium">Nova conta</Text>
            </Pressable>
          </View>

          {contas.carregandoLista && contas.contasFiltradas.length === 0 ? (
            <Text className="text-textMuted text-sm text-center py-10">Carregando contas…</Text>
          ) : null}

          {!contas.carregandoLista && contas.contasFiltradas.length === 0 ? (
            <Text className="text-textMuted text-sm text-center py-10">
              Nenhuma conta neste filtro
            </Text>
          ) : null}

          {contas.contasFiltradas.map((conta) => (
            <Cartao
              key={conta.id}
              className="mb-2"
            >
              <Pressable onPress={() => contas.abrirEditar(conta.id)}>
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 pr-2">
                    <Text className="text-text text-sm font-medium">{conta.descricao}</Text>
                    <Text className="text-textMuted text-[11px] mt-1">
                      {rotuloTipoConta(conta.tipo)} · {formatBRL(conta.valor)}
                    </Text>
                    <Text className="text-textMuted text-[11px] mt-0.5">
                      Competência: {conta.competencia || conta.vencimento.slice(0, 7)} ·
                      Vencimento: {formatarCompetencia(conta.vencimento)}
                    </Text>
                    <Text className="text-textMuted text-[11px] mt-0.5">
                      Caixa: {obterNomeCaixa(contas.caixasCatalogo, conta.caixaId)}
                    </Text>
                    {conta.recorrenteId ? (
                      <Text className="text-textFaint text-[10px] mt-0.5">
                        Origem: recorrente
                      </Text>
                    ) : null}
                    {conta.liquidadoEm ? (
                      <Text className="text-textFaint text-[10px] mt-0.5">
                        {rotuloLiquidacao(conta.tipo)} em{" "}
                        {formatarCompetencia(conta.liquidadoEm)}
                      </Text>
                    ) : null}
                    <Text className="text-textFaint text-[10px] mt-0.5">
                      {rotuloStatusConta(conta.status)}
                    </Text>
                  </View>
                </View>
              </Pressable>

              {conta.status === "aberta" ? (
                <BotaoLiquidar
                  tipo={conta.tipo}
                  onPress={() => contas.abrirLiquidar(conta.id)}
                />
              ) : null}
            </Cartao>
          ))}

          {contas.hasMore ? (
            <Pressable
              onPress={contas.carregarMais}
              disabled={contas.carregandoMais}
              className="mt-2 mb-4 px-3 py-3 rounded-xl border border-border items-center"
              style={{ backgroundColor: cores.surface }}
            >
              <Text className="text-text text-xs font-medium">
                {textoCarregarMais(contas.carregandoMais)}
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </View>

      <ModalFormularioConta
        visivel={contas.modalAberto}
        editando={Boolean(contas.contaEditando)}
        formulario={contas.formulario}
        caixasCatalogo={contas.caixasCatalogo}
        erro={contas.erro}
        salvando={contas.salvando}
        onFechar={contas.fecharModal}
        onSalvar={() => {
          void contas.salvar();
        }}
        onExcluir={contas.contaEditando ? contas.solicitarExclusao : undefined}
        onAtualizarCampo={contas.atualizarCampo}
      />

      <ModalLiquidarConta
        visivel={contas.modalLiquidarAberto}
        conta={contas.contaLiquidando}
        formulario={contas.formularioLiquidacao}
        caixasCatalogo={contas.caixasCatalogo}
        precisaCompensacao={contas.estouroLiquidacao.precisaCompensacao}
        estouro={contas.estouroLiquidacao.estouro}
        erro={contas.erro}
        salvando={contas.salvando}
        onFechar={contas.fecharModalLiquidar}
        onLiquidar={() => {
          void contas.liquidar();
        }}
        onAtualizarCampo={contas.atualizarCampoLiquidacao}
      />

      <ModalConfirmacao
        visivel={contas.confirmarExclusao}
        titulo="Excluir conta?"
        mensagem="A conta aberta será removida. Lançamentos já liquidados não são afetados."
        onCancelar={contas.cancelarExclusao}
        onConfirm={() => {
          void contas.confirmarExcluir();
        }}
      />
    </>
  );
}

function textoContagemLista(carregando: boolean, carregadas: number, total: number): string {
  if (carregando) {
    return "Carregando…";
  }
  return `${carregadas} de ${total}`;
}

function textoCarregarMais(carregandoMais: boolean): string {
  if (carregandoMais) {
    return "Carregando…";
  }
  return "Carregar mais";
}

function rotuloLiquidacao(tipo: "a_pagar" | "a_receber"): string {
  if (tipo === "a_pagar") {
    return "Pago";
  }
  return "Recebido";
}

function rotuloBotaoLiquidar(tipo: "a_pagar" | "a_receber"): string {
  if (tipo === "a_pagar") {
    return "Registrar pagamento";
  }
  return "Registrar recebimento";
}

function BotaoLiquidar({
  tipo,
  onPress,
}: {
  tipo: "a_pagar" | "a_receber";
  onPress: () => void;
}) {
  const cores = useCores();
  return (
    <Pressable
      onPress={onPress}
      className="mt-3 px-3 py-2 rounded-xl border border-border self-start"
      style={{ backgroundColor: cores.primaryHighlight }}
    >
      <Text className="text-text text-xs font-medium">{rotuloBotaoLiquidar(tipo)}</Text>
    </Pressable>
  );
}
