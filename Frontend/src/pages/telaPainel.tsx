import { ScrollView, Text, View } from "react-native";

import { NavegadorMes } from "@/components/acompanhamento";
import { CartaoCategoriaPainel, ModalExtratoCategoria } from "@/components/painel";
import { usePainel } from "@/entities/painel";
import { useFundoTela } from "@/shared/estiloSuperficie";
import { useCores } from "@/shared/tema";
import { MARCA } from "@/shared/tokensDesign";
import type { TelaProps } from "@/types/navigation";

export function TelaPainel(_props: TelaProps) {
  const painel = usePainel();
  const fundo = useFundoTela();
  const cores = useCores();

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: fundo }}
    >
      <ScrollView
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4 mt-1">
          <Text
            className="text-sm font-semibold uppercase tracking-wide mb-1"
            style={{ color: cores.primary }}
          >
            {MARCA}
          </Text>
          <Text className="text-text text-4xl font-medium">Painel</Text>
          <Text className="text-textMuted text-md mt-1 leading-4">
            Categorias do mês com tendência versus o mês anterior.
          </Text>
        </View>

        <NavegadorMes
          competencia={painel.competencia}
          onAnterior={painel.irMesAnterior}
          onSeguinte={painel.irMesSeguinte}
        />

        <Text className="text-textMuted text-xs font-semibold uppercase tracking-wide mb-3">
          Categorias
        </Text>

        {painel.categorias.length === 0 ? (
          <Text className="text-textMuted text-sm text-center py-10">
            Nenhum lançamento neste mês
          </Text>
        ) : (
          painel.categorias.map((categoria) => (
            <CartaoCategoriaPainel
              key={categoria.chave}
              categoria={categoria}
              onPress={() => painel.abrirExtrato(categoria)}
            />
          ))
        )}

        <View className="h-10" />
      </ScrollView>

      <ModalExtratoCategoria
        visivel={Boolean(painel.categoriaSelecionada)}
        titulo={painel.categoriaSelecionada?.nome ?? ""}
        lancamentos={painel.lancamentosExtrato}
        onFechar={painel.fecharExtrato}
      />
    </View>
  );
}
