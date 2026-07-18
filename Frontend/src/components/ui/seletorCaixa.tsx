import { View, Text, TouchableOpacity } from "react-native";
import { COLORS } from "@/shared/tokensDesign";
import { obterEstiloCaixa } from "@/shared/estilosCaixa";
import { CaixaIcon } from "@/shared/icons";
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
  const caixasDisponiveis = caixasCatalogo.filter((caixa) => caixa.id !== excluir);

  return (
    <View className="mb-3.5">
      {label ? <Text className="text-textMuted text-xs mb-1.5 font-medium">{label}</Text> : null}
      <View className="flex-row flex-wrap gap-2">
        {caixasDisponiveis.map((caixa, indice) => {
          const classesCaixa = obterEstiloCaixa(caixa.id, indice);
          const selecionada = selecionado === caixa.id;
          return (
            <TouchableOpacity
              key={caixa.id}
              onPress={() => onSelect(caixa.id)}
              className={`rounded-lg px-3 py-2 border flex-row items-center gap-1.5 ${
                selecionada ? `bg-surface2 ${classesCaixa.border}` : "bg-surface border-border"
              }`}
            >
              <CaixaIcon
                id={caixa.id}
                indice={indice}
                size={14}
                color={selecionada ? COLORS.text : COLORS.textMuted}
              />
              <Text
                className={`text-xs ${selecionada ? "text-text font-medium" : "text-textMuted"}`}
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
