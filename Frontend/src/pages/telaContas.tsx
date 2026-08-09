import { useEffect } from "react";
import { BackHandler, Pressable, ScrollView, Text, View } from "react-native";

import { ModalFormularioConta, ModalLiquidarConta } from "@/components/contas";
import { useTelaContas } from "@/entities/contas";
import {
  Cartao,
  ModalConfirmacao,
  CabecalhoTela,
} from "@/shared/components";
import { obterNomeCaixa } from "@/shared/catalogoCaixas";
import { Plus } from "@/shared/icons";
import { useCores } from "@/shared/tema";
import { rotuloStatusConta, rotuloTipoConta } from "@/service/contas";
import type { TelaProps } from "@/types/navigation";
import { formatBRL, formatarCompetencia } from "@/utils/helpers";

export function TelaContas({ setTela, voltarPara = "previsao" }: TelaProps) {
  const contas = useTelaContas();
  const cores = useCores();

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
      setTela(voltarPara);
      return true;
    });

    return () => subscription.remove();
  }, [contas, setTela, voltarPara]);

  return (
    <>
      <ScrollView
        className="flex-1 bg-bg"
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CabecalhoTela
          title="Contas"
          setTela={setTela}
          backTo={voltarPara}
        />

        <Text className="text-textMuted text-[11px] mb-4 leading-4">
          Compromissos a pagar e a receber. Ao liquidar, o Flux registra a saída ou entrada
          real nas caixas.
        </Text>

        <View className="flex-row gap-2 mb-3">
          {(
            [
              { id: "aberta", label: "Abertas" },
              { id: "liquidada", label: "Liquidadas" },
              { id: "todas", label: "Todas" },
            ] as const
          ).map((filtro) => (
            <Pressable
              key={filtro.id}
              onPress={() => contas.setFiltroStatus(filtro.id)}
              className="px-3 py-2 rounded-xl border border-border"
              style={{
                backgroundColor:
                  contas.filtroStatus === filtro.id ? cores.primaryHighlight : cores.surface,
              }}
            >
              <Text className="text-text text-xs font-medium">{filtro.label}</Text>
            </Pressable>
          ))}
        </View>

        <View className="flex-row justify-end mb-3">
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

        {contas.contasFiltradas.length === 0 ? (
          <Text className="text-textMuted text-sm text-center py-10">
            Nenhuma conta neste filtro
          </Text>
        ) : (
          contas.contasFiltradas.map((conta) => (
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
                      Vencimento: {formatarCompetencia(conta.vencimento)}
                    </Text>
                    <Text className="text-textMuted text-[11px] mt-0.5">
                      Caixa: {obterNomeCaixa(contas.caixasCatalogo, conta.caixaId)}
                    </Text>
                    {conta.liquidadoEm ? (
                      <Text className="text-textFaint text-[10px] mt-0.5">
                        {conta.tipo === "a_pagar" ? "Pago" : "Recebido"} em{" "}
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
          ))
        )}
      </ScrollView>

      <ModalFormularioConta
        visivel={contas.modalAberto}
        editando={Boolean(contas.contaEditando)}
        formulario={contas.formulario}
        caixasCatalogo={contas.caixasCatalogo}
        erro={contas.erro}
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
        erro={contas.erro}
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
      <Text className="text-text text-xs font-medium">
        {tipo === "a_pagar" ? "Registrar pagamento" : "Registrar recebimento"}
      </Text>
    </Pressable>
  );
}
