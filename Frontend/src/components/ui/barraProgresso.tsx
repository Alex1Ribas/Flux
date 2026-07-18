import { View } from "react-native";
import { COLORS } from "@/shared/tokensDesign";

interface PropriedadesBarraProgresso {
  valor: number;
  max: number;
  color?: string;
}

export function BarraProgresso({ valor, max, color = COLORS.text }: PropriedadesBarraProgresso) {
  const pct = max > 0 ? Math.min((valor / max) * 100, 100) : 0;

  return (
    <View className="h-1.5 bg-surface2 rounded-full overflow-hidden">
      <View
        className="h-full rounded-full"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </View>
  );
}
