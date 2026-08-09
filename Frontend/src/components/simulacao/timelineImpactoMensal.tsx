import { Text, View } from "react-native";

import { Cartao } from "@/shared/components";
import { useCores } from "@/shared/tema";
import type { SimulationResult, StatusRiscoMensal } from "@/types/flux";
import { formatBRL } from "@/utils/helpers";

interface TimelineImpactoMensalProps {
  resultado: SimulationResult | null;
}

export function TimelineImpactoMensal({ resultado }: TimelineImpactoMensalProps) {
  const cores = useCores();
  if (!resultado) return null;

  return (
    <Cartao className="mb-3">
      <Text className="text-text text-sm font-semibold mb-2">Comprometimento mensal</Text>
      {resultado.monthlyImpacts.map((impacto) => (
        <View
          key={impacto.referenciaMes}
          className="mb-2 pb-2 border-b border-border"
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-text text-xs font-semibold">{impacto.referenciaMes}</Text>
            <View
              className="px-2 py-1 rounded-md"
              style={{ backgroundColor: corStatus(impacto.classificacaoDepois, cores) }}
            >
              <Text className="text-[10px] text-text">
                {impacto.classificacaoDepois.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text className="text-textMuted text-xs mt-1">
            Entradas previstas: {formatBRL(impacto.entradasPrevistas)}
          </Text>
          <Text className="text-textMuted text-xs">
            Comprometido antes: {formatBRL(impacto.compromissosAnteriores)}
          </Text>
          <Text className="text-textMuted text-xs">
            Comprometido depois: {formatBRL(impacto.totalComprometido)}
          </Text>
          <Text className="text-textMuted text-xs">
            Percentual: {formatarPercentual(impacto.comprometimentoAntes)} →{" "}
            {formatarPercentual(impacto.comprometimentoDepois)}
          </Text>
          {impacto.alertas.map((alerta) => (
            <Text
              key={alerta}
              className="text-warning text-[11px] mt-1"
            >
              {alerta}
            </Text>
          ))}
        </View>
      ))}
    </Cartao>
  );
}

function formatarPercentual(valor: number | null): string {
  if (valor === null) return "crítico";
  return `${(valor * 100).toFixed(1)}%`;
}

function corStatus(
  status: StatusRiscoMensal,
  cores: ReturnType<typeof useCores>,
): string {
  if (status === "saudavel") return cores.successHighlight;
  if (status === "atencao") return cores.warningHighlight;
  return cores.errorHighlight;
}
