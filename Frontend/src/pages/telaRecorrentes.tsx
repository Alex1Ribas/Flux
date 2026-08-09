import { useEffect } from "react";
import { BackHandler, Pressable, ScrollView, Text, View } from "react-native";

import { ModalFormularioItemRecorrente } from "@/components/acompanhamento/modalFormularioItemRecorrente";
import {
  Cartao,
  ModalConfirmacao,
  CabecalhoTela,
} from "@/shared/components";
import { useTelaConfigRecorrentes } from "@/entities/acompanhamento";
import { useCores } from "@/shared/tema";
import { Plus } from "@/shared/icons";
import { obterNomeCaixa } from "@/shared/catalogoCaixas";
import { formatBRL, getCompetenciaLabel, getDiaCompetencia, temDiaNaCompetencia } from "@/utils/helpers";
import type { TelaProps } from "@/types/navigation";

export function TelaRecorrentes({ setTela, voltarPara = "previsao" }: TelaProps) {
  const config = useTelaConfigRecorrentes();
  const cores = useCores();

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (config.confirmarExclusao) {
        config.cancelarExclusao();
        return true;
      }
      if (config.modalAberto) {
        config.fecharModal();
        return true;
      }
      setTela(voltarPara);
      return true;
    });

    return () => subscription.remove();
  }, [
    config.confirmarExclusao,
    config.modalAberto,
    config.cancelarExclusao,
    config.fecharModal,
    setTela,
    voltarPara,
  ]);

  return (
    <>
      <ScrollView
        className="flex-1 bg-bg"
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CabecalhoTela
          title="Itens recorrentes"
          setTela={setTela}
          backTo={voltarPara}
        />

        <Text className="text-textMuted text-[11px] mb-4 leading-4">
          Regra mensal (template): salário, aluguel, contas fixas. Cada mês vira uma Conta
          concreta que você pode liquidar sem mudar a regra.
        </Text>

        <View className="flex-row justify-end mb-3">
          <Pressable
            onPress={() => config.abrirCriar()}
            className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface"
          >
            <Plus
              size={16}
              color={cores.text}
            />
            <Text className="text-text text-xs font-medium">Novo item</Text>
          </Pressable>
        </View>

        {config.itensRecorrentes.length === 0 ? (
          <Text className="text-textMuted text-sm text-center py-10">
            Nenhum item recorrente cadastrado
          </Text>
        ) : (
          config.itensRecorrentes.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => config.abrirEditar(item.id)}
            >
              <Cartao className="mb-2">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 pr-2">
                    <Text className="text-text text-sm font-medium">{item.nome}</Text>
                    <Text className="text-textMuted text-[11px] mt-1">
                      {item.tipo === "entrada" ? "Entrada" : "Saída"} · {formatBRL(item.valor)}/mês
                    </Text>
                    {item.caixaId ? (
                      <Text className="text-textMuted text-[11px] mt-0.5">
                        {item.tipo === "entrada" ? "Destino" : "Origem"}:{" "}
                        {obterNomeCaixa(config.caixasCatalogo, item.caixaId)}
                      </Text>
                    ) : null}
                    <Text className="text-textFaint text-[10px] mt-0.5">
                      {temDiaNaCompetencia(item.competenciaInicial)
                        ? `Dia ${getDiaCompetencia(item.competenciaInicial)} · desde ${getCompetenciaLabel(item.competenciaInicial)}`
                        : `Desde ${getCompetenciaLabel(item.competenciaInicial)}`}
                      {" · "}
                      {item.duracaoMeses} meses
                    </Text>
                  </View>
                  <Text
                    className="text-[10px] uppercase"
                    style={{ color: item.ativo ? cores.success : cores.textMuted }}
                  >
                    {item.ativo ? "Ativo" : "Inativo"}
                  </Text>
                </View>
              </Cartao>
            </Pressable>
          ))
        )}

        <View className="h-10" />
      </ScrollView>

      <ModalFormularioItemRecorrente
        visivel={config.modalAberto}
        editando={Boolean(config.itemEditando)}
        formulario={config.formulario}
        caixasCatalogo={config.caixasCatalogo}
        erro={config.erro}
        salvando={config.salvando}
        onFechar={config.fecharModal}
        onSalvar={() => {
          void config.salvar();
        }}
        onExcluir={config.solicitarExclusao}
        onAtualizarCampo={config.atualizarCampo}
      />

      <ModalConfirmacao
        visivel={config.confirmarExclusao}
        titulo="Excluir item"
        mensagem="O item será removido do planejamento. Lançamentos já realizados (presentes) serão mantidos; compromissos futuros materializados serão removidos."
        onConfirm={config.confirmarExcluir}
        onCancelar={config.cancelarExclusao}
      />
    </>
  );
}
