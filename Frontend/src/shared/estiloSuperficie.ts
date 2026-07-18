import { Platform, type ViewStyle } from "react-native";

import { useTema } from "@/shared/tema";

/** Sombra difusa só no Light; no Dark o contraste surface/bg basta. */
export function useEstiloSuperficie(extra?: ViewStyle): ViewStyle {
  const { isDark, cores } = useTema();

  return {
    backgroundColor: cores.surface,
    borderColor: cores.border,
    ...(isDark
      ? {
          shadowOpacity: 0,
          elevation: 0,
        }
      : {
          shadowColor: cores.border,
          shadowOpacity: 0.5,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 12 },
          elevation: Platform.OS === "android" ? 8 : 0,
        }),
    ...extra,
  };
}

export function useFundoTela(): string {
  const { cores } = useTema();
  return cores.bg;
}
