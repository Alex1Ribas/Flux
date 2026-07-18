import type { LucideIcon } from "lucide-react-native";

import { COLORS } from "@/shared/tokensDesign";
import { CircleAlert, CircleCheck, CircleX, Minus } from "@/shared/icons";
import type { NivelRiscoCaixa } from "@/types/flux";

export interface ConfigVisualRisco {
  color: string;
  label: string;
  bg: string;
  Icon: LucideIcon;
}

export function getConfigVisualRisco(nivel: NivelRiscoCaixa): ConfigVisualRisco {
  switch (nivel) {
    case "saudavel":
      return {
        color: COLORS.success,
        label: "Saudável",
        bg: COLORS.successHighlight,
        Icon: CircleCheck as LucideIcon,
      };
    case "atencao":
      return {
        color: COLORS.warning,
        label: "Atenção",
        bg: COLORS.warningHighlight,
        Icon: CircleAlert as LucideIcon,
      };
    case "critico":
      return {
        color: COLORS.error,
        label: "Crítico",
        bg: COLORS.errorHighlight,
        Icon: CircleX as LucideIcon,
      };
    default:
      return {
        color: COLORS.textMuted,
        label: "Sem meta",
        bg: COLORS.surface2,
        Icon: Minus as LucideIcon,
      };
  }
}
