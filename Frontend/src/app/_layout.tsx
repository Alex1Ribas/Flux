import "../global.css";
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider, Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { AnimatedSplashOverlay } from "@/components/iconeAnimado";
import { TemaProvider, useTema } from "@/shared/tema";

SplashScreen.preventAutoHideAsync();

function NavegacaoComTema() {
  const { isDark } = useTema();
  return (
    <NavThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Slot />
    </NavThemeProvider>
  );
}

export default function TabLayout() {
  return (
    <TemaProvider>
      <NavegacaoComTema />
    </TemaProvider>
  );
}
