import { Text, View } from "react-native";

import { Cartao } from "@/shared/components";
import type { SimulationResult } from "@/types/flux";
import { formatBRL } from "@/utils/helpers";

interface ImpactosCompensacaoProps {
  resultado: SimulationResult | null;
}

export function ImpactosCompensacao({ resultado }: ImpactosCompensacaoProps) {
  if (!resultado) return null;

  return (
    <>
      {resultado.budgetImpacts.length > 0 ? (
        <Cartao className="mb-3">
          <Text className="text-text text-sm font-semibold mb-2">Impacto por orçamento</Text>
          {resultado.budgetImpacts.map((impacto) => (
            <View
              key={impacto.fonteId}
              className="mb-2"
            >
              <Text className="text-text text-xs font-semibold">{impacto.nome}</Text>
              <Text className="text-textMuted text-xs">
                {formatBRL(impacto.valorPlanejadoMensal)} → {formatBRL(impacto.novoValorMensal)}
              </Text>
              <Text className="text-textMuted text-xs">
                Redução: {formatBRL(impacto.valorMensalDestinado)}
                {impacto.percentualReducao !== null
                  ? ` (${(impacto.percentualReducao * 100).toFixed(1)}%)`
                  : ""}
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
      ) : null}

      {resultado.goalImpacts.length > 0 ? (
        <Cartao className="mb-3">
          <Text className="text-text text-sm font-semibold mb-2">Impacto por objetivo</Text>
          {resultado.goalImpacts.map((impacto) => (
            <View
              key={impacto.fonteId}
              className="mb-2"
            >
              <Text className="text-text text-xs font-semibold">{impacto.nome}</Text>
              <Text className="text-textMuted text-xs">
                Aporte: {formatBRL(impacto.aporteMensalPlanejado)} →{" "}
                {formatBRL(impacto.novoAporteMensal)}
              </Text>
              <Text className="text-textMuted text-xs">
                Prazo:{" "}
                {impacto.prazoOriginalMeses !== null
                  ? `${impacto.prazoOriginalMeses} meses`
                  : "indefinido"}{" "}
                →{" "}
                {impacto.novoPrazoMeses !== null
                  ? `${impacto.novoPrazoMeses} meses`
                  : "congelado"}
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
      ) : null}
    </>
  );
}
