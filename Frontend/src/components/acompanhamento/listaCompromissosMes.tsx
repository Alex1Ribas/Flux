import { View, Text } from "react-native";

import { Cartao, TituloSecao } from "@/shared/components";
import { COLORS } from "@/shared/tokensDesign";
import type { CompromissoMes } from "@/types/flux";
import { formatBRL } from "@/utils/helpers";

interface ListaCompromissosMesProps {
  compromissos: CompromissoMes[];
}

/** Bloco C: listagem estática de recorrente === true (entradas e saídas). */
export function ListaCompromissosMes({ compromissos }: ListaCompromissosMesProps) {
  return (
    <View className="mb-4">
      <TituloSecao title="Compromissos do mês" />
      {compromissos.length === 0 ? (
        <Text className="text-textMuted text-md mb-2">
          Nenhum compromisso recorrente neste mês
        </Text>
      ) : (
        compromissos.map((item) => {
          const cor = item.tipo === "entrada" ? COLORS.success : COLORS.error;
          const prefixo = item.tipo === "entrada" ? "+" : "−";

          return (
            <Cartao
              key={item.id}
              className="mb-2"
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-1 pr-2">
                  <Text className="text-text text-md font-medium">{item.descricao}</Text>
                  <Text className="text-textFaint text-md mt-0.5">
                    {item.tipo === "entrada" ? "Entrada recorrente" : "Saída recorrente"}
                    {item.dia !== null ? ` · dia ${item.dia}` : ""}
                  </Text>
                </View>
                <Text
                  className="text-md font-semibold"
                  style={{ color: cor }}
                >
                  {prefixo}
                  {formatBRL(item.valor)}
                </Text>
              </View>
            </Cartao>
          );
        })
      )}
    </View>
  );
}
