import { Pressable, ScrollView, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useEffect } from "react";

import type { CaixaId } from "@/shared/estilosCaixa";
import type { CaixaCatalogoItem } from "@/types/flux";
import { formatBRL } from "@/utils/helpers";

import { useTokensInicio } from "./tokensInicio";

interface CabecalhoCaixasProps {
  caixasCatalogo: CaixaCatalogoItem[];
  caixas: Record<string, number>;
  selecionada: CaixaId;
  onSelect: (caixaId: CaixaId) => void;
}

function CaixaCard({
  nome,
  valor,
  ativo,
  onPress,
}: {
  nome: string;
  valor: number;
  ativo: boolean;
  onPress: () => void;
}) {
  const tokens = useTokensInicio();
  const progresso = useSharedValue(ativo ? 1 : 0);

  useEffect(() => {
    progresso.value = withTiming(ativo ? 1 : 0, { duration: 200 });
  }, [ativo, progresso]);

  /** Só anima opacidade — cores ficam no style React para acompanhar o tema. */
  const estiloOpacidade = useAnimatedStyle(() => ({
    opacity: 0.72 + progresso.value * 0.28,
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: ativo }}
      accessibilityLabel={nome}
    >
      <Animated.View
        style={[
          {
            width: 148,
            borderRadius: 14,
            paddingVertical: 14,
            paddingHorizontal: 12,
            minHeight: 88,
            justifyContent: "center",
            borderWidth: ativo ? 1.5 : 0.5,
            borderColor: ativo ? tokens.borderActive : tokens.border,
            backgroundColor: ativo ? tokens.surfaceActive : tokens.surface,
          },
          estiloOpacidade,
        ]}
      >
        <Text
          style={{
            color: tokens.textMuted,
            fontSize: 14,
            fontWeight: "500",
            marginBottom: 4,
          }}
          numberOfLines={1}
        >
          {nome}
        </Text>
        <Text
          style={{
            color: tokens.text,
            fontSize: 18,
            fontWeight: "600",
          }}
          numberOfLines={1}
        >
          {formatBRL(valor)}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function CabecalhoCaixas({
  caixasCatalogo,
  caixas,
  selecionada,
  onSelect,
}: CabecalhoCaixasProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="px-4 gap-3"
    >
      {caixasCatalogo.map((caixa) => (
        <CaixaCard
          key={caixa.id}
          nome={caixa.nome}
          valor={caixas[caixa.id] || 0}
          ativo={selecionada === caixa.id}
          onPress={() => onSelect(caixa.id)}
        />
      ))}
    </ScrollView>
  );
}
