import { View, Text } from "react-native";

import { Cartao, TituloSecao } from "@/shared/components";
import { obterRotuloTipoImpacto } from "@/entities/acompanhamento";
import { COLORS } from "@/shared/tokensDesign";
import type { ImpactoRisco } from "@/types/flux";
import { formatBRL, getCompetenciaLabel } from "@/utils/helpers";

interface ListaImpactosRiscoProps {
  impactos: ImpactoRisco[];
}

/** Bloco D: extrato cronológico de recorrente === false. */
export function ListaImpactosRisco({ impactos }: ListaImpactosRiscoProps) {
  return (
    <View className="mb-4">
      <TituloSecao title="Impactos no risco" />
      {impactos.length === 0 ? (
        <Text className="text-textMuted text-md mb-2">
          Nenhuma movimentação avulsa neste mês
        </Text>
      ) : (
        impactos.map((impacto) => {
          const cor = impacto.direcao === "aumenta" ? COLORS.error : COLORS.success;
          const sinal = impacto.direcao === "aumenta" ? "+" : "";
          const prefixoValor = impacto.tipo === "renda_extra" ? "+" : "−";

          return (
            <Cartao
              key={impacto.id}
              className="mb-2"
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-1 pr-2">
                  <Text className="text-text text-md font-medium">{impacto.descricao}</Text>
                  <Text className="text-textFaint text-md mt-0.5">
                    {obterRotuloTipoImpacto(impacto.tipo)} ·{" "}
                    {getCompetenciaLabel(impacto.competencia)}
                  </Text>
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
          );
        })
      )}
    </View>
  );
}
