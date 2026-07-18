import { View, TouchableOpacity, Text } from "react-native";
import { COLORS } from "@/shared/tokensDesign";
import { ArrowLeft } from "@/shared/icons";
import type { SetTela, TelaId } from "@/types/navigation";

interface PropriedadesCabecalhoTela {
  title: string;
  setTela: SetTela;
  backTo?: TelaId;
}

export function CabecalhoTela({ title, setTela, backTo = "inicio" }: PropriedadesCabecalhoTela) {
  return (
    <View className="flex-row items-center mb-5 gap-3">
      <TouchableOpacity
        onPress={() => setTela(backTo)}
        className="p-1"
      >
        <ArrowLeft
          size={22}
          color={COLORS.text}
          strokeWidth={2}
        />
      </TouchableOpacity>
      <Text className="text-text text-lg font-medium">{title}</Text>
    </View>
  );
}
