import "../global.css";
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider, Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { AnimatedSplashOverlay } from "@/components/iconeAnimado";
import { useAtualizacaoOta } from "@/hooks/useAtualizacaoOta";
import { TelaAtualizacao } from "@/pages/telaAtualizacao";
import { TemaProvider, useTema } from "@/shared/tema";

SplashScreen.preventAutoHideAsync();

function NavegacaoComTema() {
  const { isDark } = useTema();
  const estadoAtualizacao = useAtualizacaoOta();

  let conteudo = <Slot />;
  if (estadoAtualizacao === "baixando") {
    conteudo = <TelaAtualizacao />;
  }

  return (
    <NavThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      {conteudo}
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
