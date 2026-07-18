import { View, Text } from "react-native";
import Svg, { Circle, Polyline, Text as SvgText } from "react-native-svg";

import { COLORS } from "@/shared/tokensDesign";
import type { PontoEvolucaoRisco } from "@/types/flux";

const ALTURA = 128;
const LARGURA = 300;
const MARGEM = { topo: 8, base: 24, esquerda: 8, direita: 8 };

interface GraficoAcompanhamentoMesProps {
  pontos: PontoEvolucaoRisco[];
}

function montarCoordenadas(
  pontos: PontoEvolucaoRisco[],
  chave: "riscoEsperado" | "riscoReal",
  maxRisco: number,
  minRisco: number,
  areaLargura: number,
  areaAltura: number
): string {
  if (pontos.length === 0) return "";
  const amplitude = Math.max(maxRisco - minRisco, 1);
  const passo = Math.max(1, Math.floor(pontos.length / 12));
  const amostra = pontos.filter((_, indice) => indice % passo === 0 || indice === pontos.length - 1);

  return amostra
    .map((ponto, indice) => {
      const x = MARGEM.esquerda + (indice / Math.max(amostra.length - 1, 1)) * areaLargura;
      const valor = ponto[chave];
      const y = MARGEM.topo + areaAltura - ((valor - minRisco) / amplitude) * areaAltura;
      return `${x},${y}`;
    })
    .join(" ");
}

function pontosAmostra(pontos: PontoEvolucaoRisco[]) {
  const passo = Math.max(1, Math.floor(pontos.length / 12));
  return pontos.filter((_, indice) => indice % passo === 0 || indice === pontos.length - 1);
}

/** Bloco B: linha prevista (fixa) + linha realidade (avulsos). */
export function GraficoAcompanhamentoMes({ pontos }: GraficoAcompanhamentoMesProps) {
  const areaLargura = LARGURA - MARGEM.esquerda - MARGEM.direita;
  const areaAltura = ALTURA - MARGEM.topo - MARGEM.base;
  const amostra = pontosAmostra(pontos);
  const valores = amostra.flatMap((ponto) => [ponto.riscoEsperado, ponto.riscoReal]);
  const maxRisco = Math.max(...valores, 10);
  const minRisco = Math.min(...valores, 0);

  const coordsPrevisto = montarCoordenadas(
    pontos,
    "riscoEsperado",
    maxRisco,
    minRisco,
    areaLargura,
    areaAltura
  );
  const coordsReal = montarCoordenadas(
    pontos,
    "riscoReal",
    maxRisco,
    minRisco,
    areaLargura,
    areaAltura
  );

  return (
    <View className="bg-surface rounded-2xl p-4 border border-border mb-4">
      <Text className="text-textMuted text-md mb-3 uppercase tracking-wide">
        Evolução do risco
      </Text>
      <View className="flex-row flex-wrap gap-x-4 gap-y-2 mb-3">
        <View className="flex-row items-center gap-1.5">
          <View
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: COLORS.primary }}
          />
          <Text className="text-textMuted text-md">Previsto (fixo)</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: COLORS.text }}
          />
          <Text className="text-textMuted text-md">Realidade (avulsos)</Text>
        </View>
      </View>

      {pontos.length === 0 ? (
        <Text className="text-textMuted text-md text-center py-8">Sem dados para este mês</Text>
      ) : (
        <Svg
          width="100%"
          height={ALTURA}
          viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        >
          <Polyline
            points={coordsPrevisto}
            fill="none"
            stroke={COLORS.primary}
            strokeWidth={2}
            strokeDasharray="5 3"
          />
          <Polyline
            points={coordsReal}
            fill="none"
            stroke={COLORS.text}
            strokeWidth={2}
          />
          {amostra.map((ponto, indice) => {
            const x = MARGEM.esquerda + (indice / Math.max(amostra.length - 1, 1)) * areaLargura;
            const amplitude = Math.max(maxRisco - minRisco, 1);
            const yReal =
              MARGEM.topo +
              areaAltura -
              ((ponto.riscoReal - minRisco) / amplitude) * areaAltura;
            return (
              <Circle
                key={ponto.dia}
                cx={x}
                cy={yReal}
                r={3}
                fill={COLORS.text}
              />
            );
          })}
          {amostra.map((ponto, indice) => {
            const x = MARGEM.esquerda + (indice / Math.max(amostra.length - 1, 1)) * areaLargura;
            return (
              <SvgText
                key={`label-${ponto.dia}`}
                x={x}
                y={ALTURA - 4}
                fill={COLORS.textFaint}
                fontSize={12}
                textAnchor="middle"
              >
                {ponto.label}
              </SvgText>
            );
          })}
        </Svg>
      )}
    </View>
  );
}
