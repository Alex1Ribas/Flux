import { View, Text } from "react-native";
import { COLORS } from "@/shared/tokensDesign";

interface PropriedadesSelo {
  label: string;
  color?: string;
  bg?: string;
  className?: string;
}

export function Selo({ label, color = COLORS.textMuted, bg, className = "" }: PropriedadesSelo) {
  return (
    <View
      className={`rounded-full px-2 py-0.5 ${className}`}
      style={{ backgroundColor: bg || COLORS.surface2 }}
    >
      <Text
        className="text-[11px] font-semibold"
        style={{ color }}
      >
        {label}
      </Text>
    </View>
  );
}
