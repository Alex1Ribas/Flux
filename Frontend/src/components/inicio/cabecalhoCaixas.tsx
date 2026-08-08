import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { ordenarCaixasPorSaldo } from "@/shared/catalogoCaixas";
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

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: ativo }}
      accessibilityLabel={`${nome}, ${formatBRL(valor)}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View
        style={{
          width: 148,
          borderRadius: 14,
          paddingVertical: 14,
          paddingHorizontal: 12,
          minHeight: 88,
          justifyContent: "center",
          borderWidth: ativo ? 1.5 : 0.5,
          borderColor: ativo ? tokens.borderActive : tokens.border,
          backgroundColor: ativo ? tokens.surfaceActive : tokens.surface,
        }}
      >
        <Text
          style={{
            color: tokens.textMuted,
            fontSize: 14,
            fontWeight: "600",
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
            fontWeight: "700",
          }}
          numberOfLines={1}
        >
          {formatBRL(valor)}
        </Text>
      </View>
    </Pressable>
  );
}

export function CabecalhoCaixas({
  caixasCatalogo,
  caixas,
  selecionada,
  onSelect,
}: CabecalhoCaixasProps) {
  const caixasOrdenadas = useMemo(
    () => ordenarCaixasPorSaldo(caixasCatalogo, caixas),
    [caixasCatalogo, caixas]
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
    >
      {caixasOrdenadas.map((caixa) => (
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
