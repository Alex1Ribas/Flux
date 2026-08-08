import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { View } from "react-native";
import { vars } from "nativewind";

import { getItem, setItem } from "@/utils/storage";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  themes,
  themeClasses,
  themeVars,
  colorsFlat,
  colorsFlatDark,
  DEFAULT_THEME,
} = require("../../../tailwind.config.js") as {
  themes: { light: Record<string, string>; dark: Record<string, string> };
  themeClasses: { light: Record<string, string>; dark: Record<string, string> };
  themeVars: { light: Record<string, string>; dark: Record<string, string> };
  colorsFlat: Record<string, string>;
  colorsFlatDark: Record<string, string>;
  DEFAULT_THEME: ModoTema;
};

export type ModoTema = "light" | "dark";

export type CoresTema = typeof colorsFlat;

const CHAVE_TEMA = "flux_tema";

interface TemaContextoValor {
  modo: ModoTema;
  isDark: boolean;
  cores: CoresTema;
  classes: Record<string, string>;
  alternar: () => void;
  definirModo: (modo: ModoTema) => void;
}

const TemaContexto = createContext<TemaContextoValor | null>(null);

const varsPorModo = {
  light: vars(themeVars.light),
  dark: vars(themeVars.dark),
};

const coresPorModo: Record<ModoTema, CoresTema> = {
  light: colorsFlat as CoresTema,
  dark: colorsFlatDark as CoresTema,
};

interface TemaProviderProps {
  children: ReactNode;
}

/** Light é o default forçado — não segue o SO. */
export function TemaProvider({ children }: TemaProviderProps) {
  const [modo, setModo] = useState<ModoTema>(DEFAULT_THEME);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    getItem(CHAVE_TEMA)
      .then((salvo) => {
        if (salvo === "light" || salvo === "dark") {
          setModo(salvo);
        } else {
          setModo(DEFAULT_THEME);
        }
      })
      .finally(() => setPronto(true));
  }, []);

  const definirModo = useCallback((proximo: ModoTema) => {
    setModo(proximo);
    void setItem(CHAVE_TEMA, proximo);
  }, []);

  const alternar = useCallback(() => {
    definirModo(modo === "light" ? "dark" : "light");
  }, [definirModo, modo]);

  const valor = useMemo<TemaContextoValor>(
    () => ({
      modo,
      isDark: modo === "dark",
      cores: coresPorModo[modo],
      classes: themeClasses[modo],
      alternar,
      definirModo,
    }),
    [alternar, definirModo, modo]
  );

  if (!pronto) {
    return (
      <View
        style={[{ flex: 1 }, varsPorModo[DEFAULT_THEME]]}
        className="flex-1 bg-bg"
      >
        {children}
      </View>
    );
  }

  return (
    <TemaContexto.Provider value={valor}>
      <View
        style={[{ flex: 1 }, varsPorModo[modo]]}
        className="flex-1 bg-bg"
      >
        {children}
      </View>
    </TemaContexto.Provider>
  );
}

export function useTema(): TemaContextoValor {
  const ctx = useContext(TemaContexto);
  if (!ctx) {
    return {
      modo: DEFAULT_THEME,
      isDark: false,
      cores: coresPorModo.light,
      classes: themeClasses.light,
      alternar: () => undefined,
      definirModo: () => undefined,
    };
  }
  return ctx;
}

/** Cores hex reativas ao tema atual (para style / ícones). */
export function useCores(): CoresTema {
  return useTema().cores;
}

/**
 * Vars CSS do tema atual — use na raiz de `Modal`/portais,
 * que ficam fora da árvore nativa do `TemaProvider`.
 */
export function useVarsTema() {
  const { modo } = useTema();
  return varsPorModo[modo];
}

export { themes, themeClasses, colorsFlat, colorsFlatDark };
