import { View } from "react-native";

import { useCores } from "@/shared/tema";

interface PropriedadesBarraProgresso {
  valor: number;
  max: number;
  color?: string;
}

export function BarraProgresso({ valor, max, color }: PropriedadesBarraProgresso) {
  const cores = useCores();
  const pct = max > 0 ? Math.min((valor / max) * 100, 100) : 0;
  const corPreenchimento = color ?? cores.text;

  return (
    <View
      style={{
        height: 6,
        backgroundColor: cores.surface3,
        borderRadius: 999,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <View
        style={{
          height: "100%",
          width: `${pct}%`,
          backgroundColor: corPreenchimento,
          borderRadius: 999,
        }}
      />
    </View>
  );
}
