import { Text, View } from "react-native";

import { Cartao } from "@/shared/components";
import { useCores } from "@/shared/tema";
import type { SimulationResult } from "@/types/flux";
import { formatBRL } from "@/utils/helpers";

interface ResumoSimulacaoProps {
  resultado: SimulationResult | null;
  parcelaMensal: number;
  carregando: boolean;
}

export function ResumoSimulacao({
  resultado,
  parcelaMensal,
  carregando,
}: ResumoSimulacaoProps) {
  const cores = useCores();

  if (carregando) {
    return (
      <Cartao className="mb-3">
        <Text className="text-textMuted text-sm">Calculando impacto...</Text>
      </Cartao>
    );
  }

  return (
    <Cartao className="mb-3">
      <Text className="text-text text-sm font-semibold mb-1">Resumo do cenário</Text>
      <Text className="text-textMuted text-xs">
        Parcela mensal estimada: {formatBRL(resultado?.parcelaMensal ?? parcelaMensal)}
      </Text>
      {resultado ? (
        <>
          <Text className="text-textMuted text-xs mt-1">
            Meses críticos: {resultado.resumoImpacto.mesesCriticos}
          </Text>
          <Text className="text-textMuted text-xs mt-1">
            Pior mês: {resultado.resumoImpacto.piorMes ?? "Não identificado"}
          </Text>
          <Text className="text-textMuted text-xs mt-1">
            Comprometimento máximo depois:{" "}
            {resultado.resumoImpacto.piorComprometimentoDepois !== null
              ? `${(resultado.resumoImpacto.piorComprometimentoDepois * 100).toFixed(1)}%`
              : "crítico (sem entrada prevista)"}
          </Text>
          {resultado.resumoImpacto.impactoBruto ? (
            <View
              className="mt-2 rounded-lg p-2"
              style={{ backgroundColor: cores.primaryHighlight }}
            >
              <Text className="text-xs text-textMuted">
                Você está simulando impacto bruto, sem declarar ainda de onde o valor sairá.
              </Text>
            </View>
          ) : null}
        </>
      ) : (
        <Text className="text-textMuted text-xs mt-1">
          Preencha os campos para visualizar o impacto da decisão.
        </Text>
      )}
    </Cartao>
  );
}
