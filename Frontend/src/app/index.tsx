import { type ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BarraNavegacao } from "@/components/navegacao/barraNavegacao";
import {
  TelaCaixas,
  TelaConfigurar,
  TelaContas,
  TelaInicio,
  TelaAuth,
  TelaBoasVindas,
  TelaParcelamento,
  TelaPainel,
  TelaPrevisao,
  TelaRecorrentes,
  TelaSimulacao,
} from "@/pages";
import { ProvedorQueryApp } from "@/queries";
import { AuthProvider, useAuth } from "@/entities/auth";
import {
  SincronizadorFinanceApi,
  useEstadoSincronizacaoFinance,
  useRetrySincronizacaoFinance,
} from "@/entities/sincronizacao";
import { useTema } from "@/shared/tema";
import type { NavParams, TelaId } from "@/types/navigation";
import { TELAS_COM_NAV } from "@/types/navigation";
import { getItem, setItem } from "@/utils/storage";

const chaveBoasVindas = (usuarioId: string) => `boas_vindas_concluidas:${usuarioId}`;

export default function App() {
  const [tela, setTelaState] = useState<TelaId>("inicio");
  const [navParams, setNavParams] = useState<NavParams>({});

  const setTela = (novaTela: TelaId, params?: NavParams) => {
    setNavParams(params || {});
    setTelaState(novaTela);
  };

  const propsTela = {
    setTela,
    horizonteInicial: navParams.horizonteInicial,
    modoInicial: navParams.modoInicial,
    caixaInicial: navParams.caixaInicial,
    voltarPara: navParams.voltarPara,
  };

  const renderTela = () => {
    switch (tela) {
      case "inicio":
        return <TelaInicio {...propsTela} />;
      case "previsao":
        return <TelaPrevisao {...propsTela} />;
      case "caixas":
        return <TelaCaixas {...propsTela} />;
      case "painel":
        return <TelaPainel {...propsTela} />;
      case "simulacao":
        return <TelaSimulacao {...propsTela} />;
      case "parcelamento":
        return <TelaParcelamento {...propsTela} />;
      case "configurar":
        return <TelaConfigurar {...propsTela} />;
      case "recorrentes":
        return <TelaRecorrentes {...propsTela} />;
      case "contas":
        return <TelaContas {...propsTela} />;
      default:
        return <TelaInicio {...propsTela} />;
    }
  };

  return (
    <ProvedorQueryApp>
      <AuthProvider>
        <AppAutenticado
          tela={tela}
          setTela={setTela}
          renderTela={renderTela}
        />
      </AuthProvider>
    </ProvedorQueryApp>
  );
}

interface AppAutenticadoProps {
  tela: TelaId;
  setTela: (tela: TelaId, params?: NavParams) => void;
  renderTela: () => ReactNode;
}

function AppAutenticado({ tela, setTela, renderTela }: AppAutenticadoProps) {
  const { sessao, carregando } = useAuth();
  const { isDark, cores } = useTema();
  const erroSincronizacao = useEstadoSincronizacaoFinance((state) => state.erro);
  const tentarSincronizar = useRetrySincronizacaoFinance();
  const [onboardingPronto, setOnboardingPronto] = useState(false);
  const [onboardingConcluido, setOnboardingConcluido] = useState(false);

  useEffect(() => {
    let cancelado = false;

    if (!sessao?.usuarioId) {
      setOnboardingPronto(true);
      setOnboardingConcluido(false);
      return;
    }

    setOnboardingPronto(false);
    const chave = chaveBoasVindas(sessao.usuarioId);
    Promise.all([getItem(chave), getItem("boas_vindas_concluidas")])
      .then(async ([valor, legado]) => {
        const concluido = valor === "true" || legado === "true";
        if (concluido && valor !== "true") {
          await setItem(chave, "true");
        }
        if (!cancelado) {
          setOnboardingConcluido(concluido);
        }
      })
      .finally(() => {
        if (!cancelado) {
          setOnboardingPronto(true);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [sessao?.usuarioId]);

  const concluirOnboarding = async () => {
    if (!sessao?.usuarioId) return;
    await setItem(chaveBoasVindas(sessao.usuarioId), "true");
    setOnboardingConcluido(true);
  };

  if (carregando || (sessao && !onboardingPronto)) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator
          size="large"
          color={cores.textMuted}
        />
      </View>
    );
  }

  if (!sessao) {
    return <TelaAuth />;
  }

  if (!onboardingConcluido) {
    return (
      <TelaBoasVindas
        setTela={setTela}
        onConcluir={concluirOnboarding}
      />
    );
  }

  const showNav = TELAS_COM_NAV.includes(tela as (typeof TELAS_COM_NAV)[number]);

  return (
    <SafeAreaView
      className="flex-1 bg-bg"
      edges={["top"]}
    >
      <SincronizadorFinanceApi />
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={cores.bg}
      />
      {erroSincronizacao ? (
        <Pressable
          onPress={() => {
            void tentarSincronizar();
          }}
          className="px-4 py-2 border-b border-border"
          style={{ backgroundColor: cores.errorHighlight }}
          accessibilityRole="button"
          accessibilityLabel="Tentar sincronizar novamente"
        >
          <Text
            className="text-xs text-center"
            style={{ color: cores.error }}
          >
            {erroSincronizacao}
          </Text>
        </Pressable>
      ) : null}
      <View className="flex-1">{renderTela()}</View>
      {showNav && (
        <BarraNavegacao
          telaAtual={tela}
          setTela={setTela}
        />
      )}
    </SafeAreaView>
  );
}
