import { View, Text } from "react-native";

import { useCores } from "@/shared/tema";

interface PropriedadesSelo {
  label: string;
  color?: string;
  bg?: string;
  className?: string;
}

export function Selo({ label, color, bg, className = "" }: PropriedadesSelo) {
  const cores = useCores();

  return (
    <View
      className={`rounded-full px-2 py-0.5 ${className}`}
      style={{ backgroundColor: bg || cores.surface2 }}
    >
      <Text
        className="text-[11px] font-semibold"
        style={{ color: color || cores.textMuted }}
      >
        {label}
      </Text>
    </View>
  );
}
