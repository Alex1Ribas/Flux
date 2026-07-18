import { TouchableOpacity, View, Text } from "react-native";

import { COLORS } from "@/shared/tokensDesign";
import { getMesLabel } from "@/utils/helpers";
import { ChevronLeft, ChevronRight } from "@/shared/icons";

interface NavegadorMesProps {
  competencia: string;
  onAnterior: () => void;
  onSeguinte: () => void;
}

export function NavegadorMes({ competencia, onAnterior, onSeguinte }: NavegadorMesProps) {
  return (
    <View className="flex-row gap-2 mb-4 items-center">
      <TouchableOpacity
        onPress={onAnterior}
        className="p-2"
        accessibilityLabel="Mês anterior"
      >
        <ChevronLeft
          size={22}
          color={COLORS.text}
          strokeWidth={2}
        />
      </TouchableOpacity>
      <View className="flex-1 items-center bg-surface rounded-lg p-2.5 border border-border">
        <Text className="text-text text-[15px] font-medium">{getMesLabel(competencia)}</Text>
      </View>
      <TouchableOpacity
        onPress={onSeguinte}
        className="p-2"
        accessibilityLabel="Próximo mês"
      >
        <ChevronRight
          size={22}
          color={COLORS.text}
          strokeWidth={2}
        />
      </TouchableOpacity>
    </View>
  );
}
