import type { LucideIcon } from "lucide-react-native";

import type { CoresTema } from "@/shared/tema";
import { CircleAlert, CircleCheck, CircleX, Minus } from "@/shared/icons";
import type { NivelRiscoCaixa } from "@/types/flux";

export interface ConfigVisualRisco {
  color: string;
  label: string;
  bg: string;
  Icon: LucideIcon;
}

export function getConfigVisualRisco(
  nivel: NivelRiscoCaixa,
  cores: CoresTema
): ConfigVisualRisco {
  switch (nivel) {
    case "saudavel":
      return {
        color: cores.success,
        label: "Saudável",
        bg: cores.successHighlight,
        Icon: CircleCheck as LucideIcon,
      };
    case "atencao":
      return {
        color: cores.warning,
        label: "Atenção",
        bg: cores.warningHighlight,
        Icon: CircleAlert as LucideIcon,
      };
    case "critico":
      return {
        color: cores.error,
        label: "Crítico",
        bg: cores.errorHighlight,
        Icon: CircleX as LucideIcon,
      };
    default:
      return {
        color: cores.textMuted,
        label: "Sem meta",
        bg: cores.surface2,
        Icon: Minus as LucideIcon,
      };
  }
}
