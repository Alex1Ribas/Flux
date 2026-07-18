import { View, Text, ScrollView, TouchableOpacity } from "react-native";

interface PropriedadesSeletorChip {
  opcoes: string[];
  selecionado: string;
  onSelect: (opcao: string) => void;
  label?: string;
}

export function SeletorChip({ opcoes, selecionado, onSelect, label }: PropriedadesSeletorChip) {
  return (
    <View className="mb-3.5">
      {label ? <Text className="text-textMuted text-xs mb-1.5 font-medium">{label}</Text> : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {opcoes.map((opcao) => {
          const selecionada = opcao === selecionado;
          return (
            <TouchableOpacity
              key={opcao}
              onPress={() => onSelect(opcao)}
              className={`rounded-full px-3.5 py-1.5 mr-2 border ${
                selecionada ? "bg-surface2 border-white/50" : "bg-surface border-border"
              }`}
            >
              <Text
                className={`text-[13px] ${selecionada ? "text-text font-medium" : "text-textMuted"}`}
              >
                {opcao}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
