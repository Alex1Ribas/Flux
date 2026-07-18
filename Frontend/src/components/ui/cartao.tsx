import { View, type ViewStyle } from "react-native";
import type { ReactNode } from "react";

import { useEstiloSuperficie } from "@/shared/estiloSuperficie";

interface PropriedadesCartao {
  children: ReactNode;
  style?: ViewStyle;
  className?: string;
}

export function Cartao({ children, style, className = "" }: PropriedadesCartao) {
  const superficie = useEstiloSuperficie();

  return (
    <View
      className={`rounded-3xl p-4 mb-3 border ${className}`}
      style={[superficie, style]}
    >
      {children}
    </View>
  );
}
