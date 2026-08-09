import { Pressable, View, Text } from "react-native";

import { Cartao, TituloSecao } from "@/shared/components";
import { ChevronDown, ChevronRight } from "@/shared/icons";
import { useCores } from "@/shared/tema";
import type { CompromissoMes } from "@/types/flux";
import { formatBRL } from "@/utils/helpers";

interface ListaCompromissosMesProps {
  compromissos: CompromissoMes[];
  expandido: boolean;
  onToggle: () => void;
}

/** Bloco C: listagem estática de recorrente === true (entradas e saídas). */
export function ListaCompromissosMes({
  compromissos,
  expandido,
  onToggle,
}: ListaCompromissosMesProps) {
  const cores = useCores();
  const Chevron = expandido ? ChevronDown : ChevronRight;

  return (
    <View className="mb-4">
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={
          expandido
            ? "Ocultar compromissos do mês"
            : "Mostrar compromissos do mês"
        }
        accessibilityState={{ expanded: expandido }}
      >
        <TituloSecao
          title="Compromissos do mês"
          right={
            <View className="flex-row items-center gap-1">
              <Text className="text-textMuted text-sm">{compromissos.length}</Text>
              <Chevron
                size={18}
                color={cores.textMuted}
                strokeWidth={2}
              />
            </View>
          }
        />
      </Pressable>

      {!expandido ? null : compromissos.length === 0 ? (
        <Text className="text-textMuted text-md mb-2">
          Nenhum compromisso recorrente neste mês
        </Text>
      ) : (
        compromissos.map((item) => {
          const cor = item.tipo === "entrada" ? cores.success : cores.error;
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
