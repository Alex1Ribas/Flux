import { useMemo } from "react";
import { Text, View } from "react-native";

import { Cartao, NumeroAnimado } from "@/shared/components";
import { ordenarCaixasPorSaldo } from "@/shared/catalogoCaixas";
import { useCores } from "@/shared/tema";
import type { CaixaCatalogoItem } from "@/types/flux";
import { formatBRL } from "@/utils/helpers";

interface ResumoDistribuicaoCaixasProps {
  caixasCatalogo: CaixaCatalogoItem[];
  caixas: Record<string, number>;
  totalDisponivel: number;
}

export function ResumoDistribuicaoCaixas({
  caixasCatalogo,
  caixas,
  totalDisponivel,
}: ResumoDistribuicaoCaixasProps) {
  const cores = useCores();
  const caixasOrdenadas = useMemo(
    () => ordenarCaixasPorSaldo(caixasCatalogo, caixas),
    [caixasCatalogo, caixas]
  );

  return (
    <Cartao className="mb-4">
      <Text className="text-textMuted text-xs font-semibold uppercase tracking-wide mb-2">
        Como está seu dinheiro?
      </Text>
      <Text className="text-textMuted text-md mb-1">Disponíveis</Text>
      <NumeroAnimado
        valor={totalDisponivel}
        className="text-text text-4xl font-medium mb-4"
      />

      <Text className="text-textMuted text-xs font-semibold uppercase tracking-wide mb-3">
        Suas caixas
      </Text>

      {caixasOrdenadas.length === 0 ? (
        <Text className="text-textMuted text-sm">Nenhuma caixa cadastrada</Text>
      ) : (
        caixasOrdenadas.map((caixa, indice) => {
          const saldo = caixas[caixa.id] || 0;
          const ultimo = indice === caixasOrdenadas.length - 1;
          return (
            <View
              key={caixa.id}
              className="flex-row justify-between items-center py-2.5"
              style={
                ultimo
                  ? undefined
                  : { borderBottomWidth: 0.5, borderBottomColor: cores.border }
              }
            >
              <Text
                className="text-text text-md font-medium flex-1 pr-3"
                numberOfLines={1}
              >
                {caixa.nome}
              </Text>
              <Text className="text-text text-md font-semibold">{formatBRL(saldo)}</Text>
            </View>
          );
        })
      )}
    </Cartao>
  );
}
