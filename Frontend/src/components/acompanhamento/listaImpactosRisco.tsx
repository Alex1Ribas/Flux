import { Pressable, View, Text } from "react-native";

import { Cartao, TituloSecao } from "@/shared/components";
import {
  obterRotuloTipoImpacto,
  type ImpactoRiscoEnriquecido,
} from "@/service/acompanhamento";
import { ChevronDown, ChevronRight } from "@/shared/icons";
import { useCores } from "@/shared/tema";
import { formatBRL, getCompetenciaLabel } from "@/utils/helpers";

interface ListaImpactosRiscoProps {
  impactos: ImpactoRiscoEnriquecido[];
  expandido: boolean;
  onToggle: () => void;
  onPressImpacto?: (impactoId: string) => void;
}

function formatarTendenciaUnificada(
  deltaPercentual: number,
  deltaQuantidade: number
): string {
  const absPct = Math.abs(deltaPercentual).toFixed(0);
  const absQtd = Math.abs(deltaQuantidade);
  const label = absQtd === 1 ? "item" : "itens";

  let seta = "→";
  if (deltaPercentual > 0 || (Math.abs(deltaPercentual) < 0.5 && deltaQuantidade > 0)) {
    seta = "↑";
  } else if (deltaPercentual < 0 || deltaQuantidade < 0) {
    seta = "↓";
  }

  return `${seta} ${absPct}% (${absQtd} ${label})`;
}

/** Bloco D: extrato cronológico de recorrente === false. */
export function ListaImpactosRisco({
  impactos,
  expandido,
  onToggle,
  onPressImpacto,
}: ListaImpactosRiscoProps) {
  const cores = useCores();
  const Chevron = expandido ? ChevronDown : ChevronRight;

  return (
    <View className="mb-4">
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={
          expandido ? "Ocultar impactos no risco" : "Mostrar impactos no risco"
        }
        accessibilityState={{ expanded: expandido }}
      >
        <TituloSecao
          title="Impactos no risco"
          right={
            <View className="flex-row items-center gap-1">
              <Text className="text-textMuted text-sm">{impactos.length}</Text>
              <Chevron
                size={18}
                color={cores.textMuted}
                strokeWidth={2}
              />
            </View>
          }
        />
      </Pressable>

      {!expandido ? null : impactos.length === 0 ? (
        <Text className="text-textMuted text-md mb-2">
          Nenhuma movimentação avulsa neste mês
        </Text>
      ) : (
        impactos.map((impacto) => {
          const cor = impacto.direcao === "aumenta" ? cores.error : cores.success;
          const sinal = impacto.direcao === "aumenta" ? "+" : "";
          const prefixoValor = impacto.tipo === "renda_extra" ? "+" : "−";

          let corTrend = cores.textMuted;
          if (
            impacto.deltaQuantidade !== null &&
            impacto.deltaPercentual !== null &&
            impacto.tendenciaNegativa !== null
          ) {
            if (
              impacto.deltaQuantidade === 0 &&
              Math.abs(impacto.deltaPercentual) < 0.5
            ) {
              corTrend = cores.textMuted;
            } else if (impacto.tendenciaNegativa) {
              corTrend = cores.error;
            } else {
              corTrend = cores.success;
            }
          }

          return (
            <Pressable
              key={impacto.id}
              onPress={onPressImpacto ? () => onPressImpacto(impacto.id) : undefined}
              disabled={!onPressImpacto}
              accessibilityRole={onPressImpacto ? "button" : undefined}
              accessibilityLabel={
                onPressImpacto
                  ? `Ver extrato do impacto ${impacto.descricao}`
                  : undefined
              }
            >
              <Cartao className="mb-2">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1 pr-2">
                    <Text className="text-text text-md font-medium">
                      {impacto.descricao}
                    </Text>
                    <Text className="text-textFaint text-md mt-0.5">
                      {obterRotuloTipoImpacto(impacto.tipo)} ·{" "}
                      {getCompetenciaLabel(impacto.competencia)}
                    </Text>
                    {impacto.deltaPercentual !== null &&
                    impacto.deltaQuantidade !== null ? (
                      <Text
                        className="text-sm mt-1 font-medium"
                        style={{ color: corTrend }}
                      >
                        {formatarTendenciaUnificada(
                          impacto.deltaPercentual,
                          impacto.deltaQuantidade
                        )}
                      </Text>
                    ) : null}
                    {impacto.quantidade !== null ? (
                      <Text className="text-textMuted text-sm mt-0.5">
                        {impacto.quantidade}{" "}
                        {impacto.quantidade === 1 ? "lançamento" : "lançamentos"} no
                        grupo
                      </Text>
                    ) : null}
                  </View>
                  <View className="items-end">
                    <Text className="text-md font-semibold text-text">
                      {prefixoValor}
                      {formatBRL(impacto.valor)}
                    </Text>
                    <Text
                      className="text-md mt-0.5"
                      style={{ color: cor }}
                    >
                      {sinal}
                      {impacto.impactoRisco.toFixed(1)} pp
                    </Text>
                  </View>
                </View>
              </Cartao>
            </Pressable>
          );
        })
      )}
    </View>
  );
}
