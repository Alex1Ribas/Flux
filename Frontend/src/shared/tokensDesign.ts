// eslint-disable-next-line @typescript-eslint/no-require-imports
const { colorsFlat } = require("../../tailwind.config.js") as {
  colorsFlat: Record<string, string>;
};

/**
 * Fallback estático = tema Light (default do produto).
 * Em componentes reativos, preferir `useCores()` de `@/shared/tema`.
 */
export const COLORS = colorsFlat as {
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;
  border: string;
  divider: string;
  text: string;
  textMuted: string;
  textFaint: string;
  white: string;
  bgLight: string;
  surfaceLight: string;
  textMutedLight: string;
  primary: string;
  primaryHover: string;
  primaryHighlight: string;
  success: string;
  successHighlight: string;
  successLight: string;
  error: string;
  errorHighlight: string;
  errorLight: string;
  warning: string;
  warningHighlight: string;
  /** @deprecated Alias de primary — mantido por compat */
  gold: string;
  goldHighlight: string;
  blue: string;
  blueHighlight: string;
  purple: string;
  purpleHighlight: string;
};

/** Nome de marca — UI apenas */
export const MARCA = "Flux" as const;

export const CAIXA_LABELS = {
  saldo_atual: "Saldo Atual",
  reserva_emergencia: "Reserva de Emergência",
  objetivo_pessoal: "Objetivo Pessoal",
} as const;

export const CAIXAS_CORES = {
  saldo_atual: { bg: COLORS.blueHighlight, text: COLORS.blue },
  reserva_emergencia: { bg: COLORS.successHighlight, text: COLORS.success },
  objetivo_pessoal: { bg: COLORS.purpleHighlight, text: COLORS.purple },
} as const;

/** Espessura padrão de borda fina */
export const BORDER_FINE = 0.5;

export type ColorToken = keyof typeof COLORS;

export { useCores, useTema, TemaProvider } from "@/shared/tema";
