import { Pressable, ScrollView, Text, View } from "react-native";

import {
  IndicadorRiscoPrincipal,
  GraficoAcompanhamentoMes,
  ListaCompromissosMes,
  ListaImpactosRisco,
  NavegadorMes,
} from "@/components/acompanhamento";
import { useTelaAcompanhamento } from "@/entities/acompanhamento";
import { useFundoTela } from "@/shared/estiloSuperficie";
import { COLORS, MARCA } from "@/shared/tokensDesign";
import { Settings } from "@/shared/icons";
import type { TelaProps } from "@/types/navigation";

export function TelaPrevisao({ setTela }: TelaProps) {
  const { competencia, dados, irMesAnterior, irMesSeguinte } = useTelaAcompanhamento();
  const fundo = useFundoTela();

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
              style={{ color: COLORS.primary }}
            >
              {MARCA}
            </Text>
            <Text className="text-4xl font-medium text-text py-3">Acompanhamento</Text>
            <Text className="text-textMuted text-md mt-1 leading-4">
              Risco mensal com base nos compromissos recorrentes e nos avulsos do dia a dia.
            </Text>
          </View>
          <Pressable
            onPress={() => setTela("recorrentes", { voltarPara: "previsao" })}
            className="p-2 bg-surface rounded-2xl border border-border shadow-xl shadow-slate-200/50"
            accessibilityLabel="Configurar itens recorrentes"
          >
            <Settings
              size={20}
              color={COLORS.text}
              strokeWidth={2}
            />
          </Pressable>
        </View>

        <NavegadorMes
          competencia={competencia}
          onAnterior={irMesAnterior}
          onSeguinte={irMesSeguinte}
        />

        <IndicadorRiscoPrincipal dados={dados} />

        <GraficoAcompanhamentoMes pontos={dados.evolucao} />

        <ListaCompromissosMes compromissos={dados.compromissos} />

        <ListaImpactosRisco impactos={dados.impactos} />

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
