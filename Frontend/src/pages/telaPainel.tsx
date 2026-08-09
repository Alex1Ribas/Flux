import { ScrollView, Text, View } from "react-native";

import { NavegadorMes } from "@/components/acompanhamento";
import {
  CartaoCategoriaPainel,
  ModalExtratoCategoria,
  ResumoDistribuicaoCaixas,
  ResumoSaudeMes,
} from "@/components/painel";
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
            Onde seu dinheiro está e como está a saúde do mês.
          </Text>
        </View>

        <NavegadorMes
          competencia={painel.competencia}
          onAnterior={painel.irMesAnterior}
          onSeguinte={painel.irMesSeguinte}
        />

        <ResumoDistribuicaoCaixas
          caixasCatalogo={painel.caixasCatalogo}
          caixas={painel.caixas}
          totalDisponivel={painel.totalDisponivel}
        />

        <ResumoSaudeMes dados={painel.saudeMes} />

        <Text className="text-textMuted text-xs font-semibold uppercase tracking-wide mb-3">
          Onde você gastou?
        </Text>

        {painel.categoriasSaida.length === 0 ? (
          <Text className="text-textMuted text-sm text-center py-6 mb-2">
            Nenhuma saída neste mês
          </Text>
        ) : (
          painel.categoriasSaida.map((categoria) => (
            <CartaoCategoriaPainel
              key={categoria.chave}
              categoria={categoria}
              onPress={() => painel.abrirExtrato(categoria)}
            />
          ))
        )}

        {painel.categoriasEntrada.length > 0 ? (
          <>
            <Text className="text-textMuted text-xs font-semibold uppercase tracking-wide mb-3 mt-4">
              De onde veio?
            </Text>
            {painel.categoriasEntrada.map((categoria) => (
              <CartaoCategoriaPainel
                key={categoria.chave}
                categoria={categoria}
                onPress={() => painel.abrirExtrato(categoria)}
              />
            ))}
          </>
        ) : null}

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
