import { View, Text } from "react-native";
import type { ReactNode } from "react";

interface PropriedadesTituloSecao {
  title: string;
  right?: ReactNode;
}

export function TituloSecao({ title, right }: PropriedadesTituloSecao) {
  return (
    <View className="flex-row justify-between items-center mb-2.5 mt-1">
      <Text className="text-text text-[15px] font-medium">{title}</Text>
      {right}
    </View>
  );
}
