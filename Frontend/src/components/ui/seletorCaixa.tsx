import { View, Text, TouchableOpacity } from "react-native";

import { CaixaIcon } from "@/shared/icons";
import { useCores } from "@/shared/tema";
import type { CaixaCatalogoItem } from "@/types/flux";

interface PropriedadesSeletorCaixa {
  caixasCatalogo: CaixaCatalogoItem[];
  selecionado: string;
  onSelect: (caixaId: string) => void;
  label?: string;
  excluir?: string;
}

export function SeletorCaixa({
  caixasCatalogo,
  selecionado,
  onSelect,
  label,
  excluir,
}: PropriedadesSeletorCaixa) {
  const cores = useCores();
  const caixasDisponiveis = caixasCatalogo.filter((caixa) => caixa.id !== excluir);

  return (
    <View style={{ marginBottom: 14 }}>
      {label ? (
        <Text
          style={{
            color: cores.textMuted,
            fontSize: 12,
            fontWeight: "600",
            marginBottom: 6,
          }}
        >
          {label}
        </Text>
      ) : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {caixasDisponiveis.map((caixa, indice) => {
          const selecionada = selecionado === caixa.id;
          const corTexto = selecionada ? cores.text : cores.textMuted;

          return (
            <TouchableOpacity
              key={caixa.id}
              onPress={() => onSelect(caixa.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: selecionada }}
              accessibilityLabel={caixa.nome}
              style={{
                backgroundColor: selecionada ? cores.surface2 : cores.surface,
                borderColor: selecionada ? cores.primary : cores.border,
                borderWidth: selecionada ? 1.5 : 1,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <CaixaIcon
                id={caixa.id}
                indice={indice}
                size={14}
                color={corTexto}
              />
              <Text
                style={{
                  color: corTexto,
                  fontSize: 12,
                  fontWeight: selecionada ? "600" : "400",
                }}
                numberOfLines={1}
              >
                {caixa.nome}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
