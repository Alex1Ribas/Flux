import { ScrollView, Text, View } from "react-native";

import {
  FormularioSimulacao,
  ImpactosCompensacao,
  ResumoSimulacao,
  TimelineImpactoMensal,
} from "@/components/simulacao";
import { useTelaSimulacao } from "@/entities/simulacao";
import { useFundoTela } from "@/shared/estiloSuperficie";
import { useCores } from "@/shared/tema";
import { MARCA } from "@/shared/tokensDesign";
import type { TelaProps } from "@/types/navigation";

export function TelaSimulacao(_props: TelaProps) {
  const simulacao = useTelaSimulacao();
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
          <Text className="text-text text-4xl font-medium">Simulação de impacto</Text>
          <Text className="text-textMuted text-md mt-1 leading-4">
            Simule compromissos parcelados e veja o efeito nos próximos meses, sem criar
            lançamentos reais.
          </Text>
        </View>

        <FormularioSimulacao
          valorTotal={simulacao.valorTotal}
          duracaoMeses={simulacao.duracaoMeses}
          dataPrimeiroPagamento={simulacao.dataPrimeiroPagamento}
          modoCompensacao={simulacao.modoCompensacao}
          fontes={simulacao.fontes}
          fontesCompativeis={simulacao.fontesCompativeis}
          onChangeValorTotal={simulacao.setValorTotal}
          onChangeDuracaoMeses={simulacao.setDuracaoMeses}
          onChangeDataPrimeiroPagamento={simulacao.setDataPrimeiroPagamento}
          onChangeModoCompensacao={simulacao.setModoCompensacao}
          onAdicionarFonte={simulacao.adicionarFonte}
          onRemoverFonte={simulacao.removerFonte}
          onAtualizarFonte={simulacao.atualizarFonte}
        />

        <ResumoSimulacao
          resultado={simulacao.resultado}
          parcelaMensal={simulacao.parcelaMensal}
          carregando={simulacao.carregando}
        />

        {simulacao.erros.length > 0 ? (
          <View className="mb-3 p-3 rounded-xl border border-border bg-surface">
            {simulacao.erros.map((erro) => (
              <Text
                key={erro}
                className="text-error text-xs mb-1"
              >
                {erro}
              </Text>
            ))}
          </View>
        ) : null}

        <ImpactosCompensacao resultado={simulacao.resultado} />
        <TimelineImpactoMensal resultado={simulacao.resultado} />
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
