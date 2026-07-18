import { COLORS } from "@/shared/tokensDesign";
import { useCores } from "@/shared/tema";

/** Tokens do início — fallback estático Light; use `useTokensInicio` em UI reativa. */
export const INICIO = {
  bg: COLORS.bg,
  surface: COLORS.surface,
  surfaceActive: COLORS.surface2,
  border: COLORS.border,
  borderActive: COLORS.primary,
  text: COLORS.text,
  textMuted: COLORS.textMuted,
  textFaint: COLORS.textFaint,
  sliderTrack: COLORS.surface,
  sliderThumb: COLORS.surface3,
} as const;

export function useTokensInicio() {
  const cores = useCores();
  return {
    bg: cores.bg,
    surface: cores.surface,
    surfaceActive: cores.surface2,
    border: cores.border,
    borderActive: cores.primary,
    text: cores.text,
    textMuted: cores.textMuted,
    textFaint: cores.textFaint,
    sliderTrack: cores.surface,
    sliderThumb: cores.surface3,
  } as const;
}
