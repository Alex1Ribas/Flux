/** Hex Tailwind de referência */
const SLATE = {
  50: "#F1F1F1",
  100: "#FCFCFC",
  200: "#e2e8f0",
  400: "#94a3b8",
  500: "#64748b",
  800: "#1e293b",
  900: "#0f172a",
  950: "#020617",
};

const VIOLET = {
  400: "#a78bfa",
  500: "#8b5cf6",
  600: "#7c3aed",
  700: "#6d28d9",
  950: "#2e1065",
};

const EMERALD = {
  400: "#34d399",
  500: "#10b981",
  100: "#d1fae5",
  900: "#064e3b",
};

const ROSE = {
  400: "#fb7185",
  500: "#f43f5e",
  100: "#ffe4e6",
  950: "#4c0519",
};

/**
 * Design tokens semânticos — fonte única do tema Flux.
 * Light é o default do produto.
 */
const themes = {
  light: {
    bg: SLATE[50],
    surface: "#ffffff",
    surface2: SLATE[100],
    surface3: SLATE[200],
    border: SLATE[200],
    divider: SLATE[200],
    text: SLATE[900],
    textMuted: SLATE[500],
    textFaint: `${SLATE[500]}99`,
    white: "#FFFFFF",
    primary: VIOLET[600],
    primaryHover: VIOLET[700],
    primaryHighlight: "#ede9fe",
    success: EMERALD[500],
    successHighlight: EMERALD[100],
    error: ROSE[500],
    errorHighlight: ROSE[100],
    warning: "#f59e0b",
    warningHighlight: "#fef3c7",
    // aliases de compat
    gold: VIOLET[600],
    goldHighlight: "#ede9fe",
    blue: "#6366f1",
    blueHighlight: "#e0e7ff",
    purple: VIOLET[400],
    purpleHighlight: "#ede9fe",
  },
  dark: {
    bg: SLATE[950],
    surface: SLATE[900],
    surface2: SLATE[800],
    surface3: "#334155",
    border: SLATE[800],
    divider: SLATE[800],
    text: SLATE[50],
    // Branco com opacidade — contraste AA sobre fundo azul-marinho
    textMuted: "rgba(255, 255, 255, 0.65)",
    textFaint: "rgba(255, 255, 255, 0.45)",
    white: "#FFFFFF",
    primary: VIOLET[500],
    primaryHover: VIOLET[600],
    primaryHighlight: VIOLET[950],
    success: EMERALD[400],
    successHighlight: EMERALD[900],
    error: ROSE[400],
    errorHighlight: ROSE[950],
    warning: "#fbbf24",
    warningHighlight: "#422006",
    gold: VIOLET[500],
    goldHighlight: VIOLET[950],
    blue: "#818cf8",
    blueHighlight: "#1e1b4b",
    purple: VIOLET[400],
    purpleHighlight: VIOLET[950],
  },
};

/** Classes Tailwind semânticas por modo (consumo opcional via hook) */
const themeClasses = {
  light: {
    background: "bg-bg",
    surface: "bg-surface",
    primary: "bg-primary",
    primaryText: "text-primary",
    border: "border-border",
    textPrimary: "text-text",
    textSecondary: "text-textMuted",
    success: "text-success",
    successBg: "bg-success",
    danger: "text-error",
    dangerBg: "bg-error",
  },
  dark: {
    background: "bg-bg",
    surface: "bg-surface",
    primary: "bg-primary",
    primaryText: "text-primary",
    border: "border-border",
    textPrimary: "text-text",
    textSecondary: "text-textMuted",
    success: "text-success",
    successBg: "bg-success",
    danger: "text-error",
    dangerBg: "bg-error",
  },
};

/** Vars NativeWind a partir da paleta (raiz do app) */
function temaParaVars(paleta) {
  const out = {};
  for (const [chave, valor] of Object.entries(paleta)) {
    out[`--color-${chave}`] = valor;
  }
  return out;
}

const themeVars = {
  light: temaParaVars(themes.light),
  dark: temaParaVars(themes.dark),
};

/** @type {import('tailwindcss').Config['theme']['extend']} */
const themeExtend = {
  colors: {
    // Tokens semânticos via CSS vars — trocam com o ThemeProvider
    bg: "var(--color-bg)",
    surface: "var(--color-surface)",
    surface2: "var(--color-surface2)",
    surface3: "var(--color-surface3)",
    border: "var(--color-border)",
    divider: "var(--color-divider)",
    text: "var(--color-text)",
    textMuted: "var(--color-textMuted)",
    textFaint: "var(--color-textFaint)",
    white: "var(--color-white)",
    primary: {
      DEFAULT: "var(--color-primary)",
      hover: "var(--color-primaryHover)",
      highlight: "var(--color-primaryHighlight)",
    },
    success: {
      DEFAULT: "var(--color-success)",
      highlight: "var(--color-successHighlight)",
    },
    error: {
      DEFAULT: "var(--color-error)",
      highlight: "var(--color-errorHighlight)",
    },
    warning: {
      DEFAULT: "var(--color-warning)",
      highlight: "var(--color-warningHighlight)",
    },
    gold: {
      DEFAULT: "var(--color-gold)",
      highlight: "var(--color-goldHighlight)",
    },
    blue: {
      DEFAULT: "var(--color-blue)",
      highlight: "var(--color-blueHighlight)",
    },
    purple: {
      DEFAULT: "var(--color-purple)",
      highlight: "var(--color-purpleHighlight)",
    },
  },
  spacing: {
    half: 2,
    one: 4,
    two: 8,
    three: 16,
    four: 24,
    five: 32,
    six: 64,
  },
  borderRadius: {
    DEFAULT: 12,
    lg: 14,
    xl: 16,
    "2xl": 20,
    "3xl": 24,
    full: 9999,
  },
  fontSize: {
    "2xs": 10,
    xs: 11,
    sm: 12,
    base: 13,
    md: 14,
    lg: 15,
    xl: 18,
    "2xl": 20,
    "3xl": 28,
  },
  fontFamily: {
    sans: ["Spline Sans", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
    serif: ["Georgia", "Times New Roman", "ui-serif", "serif"],
    rounded: ["SF Pro Rounded", "Hiragino Maru Gothic ProN", "Meiryo", "sans-serif"],
    mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
  },
  maxWidth: {
    content: 800,
  },
  iconSize: {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 22,
    xl: 40,
  },
  boxShadow: {
    soft: "0 20px 25px -5px rgb(226 232 240 / 0.5), 0 8px 10px -6px rgb(226 232 240 / 0.5)",
  },
};

const { spacing } = themeExtend;

/** Flat light (default) — usado por COLORS estático e fallback */
const colorsFlat = {
  ...themes.light,
  successLight: themes.light.success,
  errorLight: themes.light.error,
  bgLight: themes.light.bg,
  surfaceLight: themes.light.surface,
  textMutedLight: themes.light.textMuted,
};

const colorsFlatDark = {
  ...themes.dark,
  successLight: themes.dark.success,
  errorLight: themes.dark.error,
  bgLight: themes.light.bg,
  surfaceLight: themes.light.surface,
  textMutedLight: themes.light.textMuted,
};

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: themeExtend,
  },
  plugins: [],
};

module.exports = config;
module.exports.themeExtend = themeExtend;
module.exports.themes = themes;
module.exports.themeClasses = themeClasses;
module.exports.themeVars = themeVars;
module.exports.colorsFlat = colorsFlat;
module.exports.colorsFlatDark = colorsFlatDark;
module.exports.spacing = spacing;
module.exports.DEFAULT_THEME = "light";
