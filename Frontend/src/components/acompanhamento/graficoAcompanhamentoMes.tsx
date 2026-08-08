import { View, Text } from "react-native";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";

import { COLORS } from "@/shared/tokensDesign";
import type { PontoEvolucaoRisco } from "@/types/flux";

const ALTURA = 160;
const LARGURA = 300;
const MARGEM = { topo: 12, base: 28, esquerda: 32, direita: 8 };
const RISCO_MIN = 0;
const RISCO_MAX = 100;

interface GraficoAcompanhamentoMesProps {
  pontos: PontoEvolucaoRisco[];
}

function xDoDia(dia: number, diasNoMes: number, areaLargura: number): number {
  if (diasNoMes <= 1) return MARGEM.esquerda;
  return MARGEM.esquerda + ((dia - 1) / (diasNoMes - 1)) * areaLargura;
}

function yDoRisco(valor: number, areaAltura: number): number {
  const limitado = Math.min(RISCO_MAX, Math.max(RISCO_MIN, valor));
  return MARGEM.topo + areaAltura - (limitado / RISCO_MAX) * areaAltura;
}

function montarCoordenadas(
  pontos: PontoEvolucaoRisco[],
  chave: "riscoEsperado" | "riscoReal",
  diasNoMes: number,
  areaLargura: number,
  areaAltura: number
): string {
  return pontos
    .map((ponto) => {
      const x = xDoDia(ponto.dia, diasNoMes, areaLargura);
      const y = yDoRisco(ponto[chave], areaAltura);
      return `${x},${y}`;
    })
    .join(" ");
}

function rotulosEixoX(diasNoMes: number): number[] {
  const candidatos = [1, 5, 10, 15, 20, 25, diasNoMes];
  const unicos = new Set<number>();
  candidatos.forEach((dia) => {
    if (dia >= 1 && dia <= diasNoMes) unicos.add(dia);
  });
  return [...unicos].sort((a, b) => a - b);
}

/** Bloco B: risco atual (fixo) + realidade com avulsos. */
export function GraficoAcompanhamentoMes({ pontos }: GraficoAcompanhamentoMesProps) {
  const areaLargura = LARGURA - MARGEM.esquerda - MARGEM.direita;
  const areaAltura = ALTURA - MARGEM.topo - MARGEM.base;
  const diasNoMes = pontos.length > 0 ? pontos[pontos.length - 1].dia : 31;
  const labelsX = rotulosEixoX(diasNoMes);
  const labelsY = [0, 50, 100];

  const coordsPrevisto = montarCoordenadas(
    pontos,
    "riscoEsperado",
    diasNoMes,
    areaLargura,
    areaAltura
  );
  const coordsReal = montarCoordenadas(
    pontos,
    "riscoReal",
    diasNoMes,
    areaLargura,
    areaAltura
  );

  const pontosMudanca = pontos.filter((ponto, indice) => {
    if (indice === 0) return false;
    return ponto.riscoReal !== pontos[indice - 1].riscoReal;
  });

  return (
    <View className="bg-surface rounded-2xl p-4 border border-border mb-4">
      <Text className="text-textMuted text-md mb-3 uppercase tracking-wide">
        Evolução do risco
      </Text>
      <View className="flex-row flex-wrap gap-x-4 gap-y-2 mb-3">
        <View className="flex-row items-center gap-1.5">
          <View
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: COLORS.text }}
          />
          <Text className="text-textMuted text-md">Risco atual (fixo)</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: COLORS.primary }}
          />
          <Text className="text-textMuted text-md">Com avulsos</Text>
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
          {labelsY.map((valor) => {
            const y = yDoRisco(valor, areaAltura);
            return (
              <Line
                key={`grid-y-${valor}`}
                x1={MARGEM.esquerda}
                y1={y}
                x2={MARGEM.esquerda + areaLargura}
                y2={y}
                stroke={COLORS.border}
                strokeWidth={1}
              />
            );
          })}

          <Line
            x1={MARGEM.esquerda}
            y1={MARGEM.topo}
            x2={MARGEM.esquerda}
            y2={MARGEM.topo + areaAltura}
            stroke={COLORS.textMuted}
            strokeWidth={1}
          />
          <Line
            x1={MARGEM.esquerda}
            y1={MARGEM.topo + areaAltura}
            x2={MARGEM.esquerda + areaLargura}
            y2={MARGEM.topo + areaAltura}
            stroke={COLORS.textMuted}
            strokeWidth={1}
          />

          {labelsY.map((valor) => (
            <SvgText
              key={`label-y-${valor}`}
              x={MARGEM.esquerda - 6}
              y={yDoRisco(valor, areaAltura) + 4}
              fill={COLORS.textMuted}
              fontSize={10}
              textAnchor="end"
            >
              {valor}
            </SvgText>
          ))}

          <Polyline
            points={coordsPrevisto}
            fill="none"
            stroke={COLORS.text}
            strokeWidth={2}
          />
          <Polyline
            points={coordsReal}
            fill="none"
            stroke={COLORS.primary}
            strokeWidth={2}
          />

          {pontosMudanca.map((ponto) => (
            <Circle
              key={`mudanca-${ponto.dia}`}
              cx={xDoDia(ponto.dia, diasNoMes, areaLargura)}
              cy={yDoRisco(ponto.riscoReal, areaAltura)}
              r={3}
              fill={COLORS.primary}
            />
          ))}

          {labelsX.map((dia) => (
            <SvgText
              key={`label-x-${dia}`}
              x={xDoDia(dia, diasNoMes, areaLargura)}
              y={ALTURA - 6}
              fill={COLORS.textMuted}
              fontSize={10}
              textAnchor="middle"
            >
              {dia}
            </SvgText>
          ))}
        </Svg>
      )}
    </View>
  );
}
