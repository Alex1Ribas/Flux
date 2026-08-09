import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import {
  IndicadorRiscoPrincipal,
  GraficoAcompanhamentoMes,
  ListaCompromissosMes,
  ListaImpactosRisco,
  ModalFormularioLancamentoAvulso,
  NavegadorMes,
} from "@/components/acompanhamento";
import { useEditarLancamentoAvulso, useTelaAcompanhamento } from "@/entities/acompanhamento";
import { useEstiloSuperficie, useFundoTela } from "@/shared/estiloSuperficie";
import { MARCA } from "@/shared/tokensDesign";
import { useCores } from "@/shared/tema";
import { Settings } from "@/shared/icons";
import type { TelaProps } from "@/types/navigation";

export function TelaPrevisao({ setTela }: TelaProps) {
  const {
    competencia,
    dados,
    carregando,
    erro,
    recarregar,
    irMesAnterior,
    irMesSeguinte,
  } = useTelaAcompanhamento();
  const editarAvulso = useEditarLancamentoAvulso();
  const fundo = useFundoTela();
  const cores = useCores();
  const superficieBotao = useEstiloSuperficie({
    borderRadius: 16,
    padding: 8,
  });

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: fundo }}
    >
      <ScrollView
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-start mb-4 mt-1">
          <View className="flex-1 pr-3">
            <Text
              className="text-sm font-semibold uppercase tracking-wide"
              style={{ color: cores.primary }}
            >
              {MARCA}
            </Text>
            <Text className="text-4xl font-medium text-text py-3">Acompanhamento</Text>
            <Text className="text-textMuted text-md mt-1 leading-4">
              Risco mensal com base nos compromissos, contas abertas e avulsos do dia a dia.
            </Text>
          </View>
          <View>
            <Pressable
              onPress={() => setTela("recorrentes", { voltarPara: "previsao" })}
              className="border"
              style={superficieBotao}
              accessibilityLabel="Configurar itens recorrentes"
            >
              <Settings
                size={20}
                color={cores.text}
                strokeWidth={2}
              />
            </Pressable>
          </View>
        </View>

        <NavegadorMes
          competencia={competencia}
          onAnterior={irMesAnterior}
          onSeguinte={irMesSeguinte}
        />

        {carregando ? (
          <View className="items-center py-10">
            <ActivityIndicator color={cores.primary} />
          </View>
        ) : null}

        {erro ? (
          <Pressable
            onPress={recarregar}
            className="mb-4 py-3"
            accessibilityRole="button"
            accessibilityLabel="Tentar carregar acompanhamento novamente"
          >
            <Text
              className="text-sm text-center"
              style={{ color: cores.danger }}
            >
              {erro} Toque para tentar de novo.
            </Text>
          </Pressable>
        ) : null}

        {!carregando && !erro ? (
          <>
            <IndicadorRiscoPrincipal dados={dados} />

            <GraficoAcompanhamentoMes pontos={dados.evolucao} />

            <ListaCompromissosMes compromissos={dados.compromissos} />

            <ListaImpactosRisco
              impactos={dados.impactos}
              onPressImpacto={editarAvulso.abrirEditar}
            />
          </>
        ) : null}

        <View className="h-10" />
      </ScrollView>

      <ModalFormularioLancamentoAvulso
        visivel={editarAvulso.modalAberto}
        formulario={editarAvulso.formulario}
        caixasCatalogo={editarAvulso.caixasCatalogo}
        erro={editarAvulso.erro}
        salvando={editarAvulso.salvando}
        onFechar={editarAvulso.fecharModal}
        onSalvar={() => {
          void (async () => {
            const salvou = await editarAvulso.salvar();
            if (salvou) {
              recarregar();
            }
          })();
        }}
        onAtualizarCampo={editarAvulso.atualizarCampo}
      />
    </View>
  );
}
