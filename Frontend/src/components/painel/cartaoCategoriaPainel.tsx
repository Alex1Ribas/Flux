import { Text, View } from "react-native";
import { MotiPressable } from "moti/interactions";

import { Cartao, NumeroAnimado } from "@/shared/components";
import { feedbackTactilLeve } from "@/shared/feedbackTactil";
import { COLORS } from "@/shared/tokensDesign";
import type { ResumoCategoriaMes } from "@/service/painel/agruparCategoriasMes";

interface CartaoCategoriaPainelProps {
  categoria: ResumoCategoriaMes;
  onPress: () => void;
}

function formatarDeltaPct(valor: number): string {
  const abs = Math.abs(valor);
  const sinal = valor > 0 ? "↑" : valor < 0 ? "↓" : "→";
  return `${sinal} ${abs.toFixed(0)}% vs mês passado`;
}

function formatarDeltaQtd(valor: number): string {
  const abs = Math.abs(valor);
  const sinal = valor > 0 ? "↑" : valor < 0 ? "↓" : "→";
  const label = abs === 1 ? "item" : "itens";
  if (valor === 0) return `→ 0 ${label} vs mês passado`;
  return `${sinal} ${abs} ${label} vs mês passado`;
}

export function CartaoCategoriaPainel({ categoria, onPress }: CartaoCategoriaPainelProps) {
  const corTipo = categoria.tipo === "entrada" ? COLORS.success : COLORS.error;
  const corTrend =
    categoria.deltaQuantidade === 0 && Math.abs(categoria.deltaPercentual) < 0.5
      ? COLORS.textMuted
      : categoria.tendenciaNegativa
        ? COLORS.error
        : COLORS.success;
  const prefixo = categoria.tipo === "entrada" ? "+" : "−";

  return (
    <MotiPressable
      onPress={() => {
        void feedbackTactilLeve();
        onPress();
      }}
      animate={({ pressed }) => {
        "worklet";
        return {
          scale: pressed ? 0.95 : 1,
        };
      }}
      transition={{ type: "timing", duration: 120 }}
      accessibilityRole="button"
      accessibilityLabel={`Detalhar categoria ${categoria.nome}`}
    >
      <Cartao className="mb-2">
        <View className="flex-row justify-between items-start gap-3">
          <View className="flex-1">
            <Text
              className="text-text text-md font-semibold"
              numberOfLines={1}
            >
              {categoria.nome}
            </Text>
            <Text className="text-textMuted text-sm mt-1">
              {categoria.quantidade}{" "}
              {categoria.quantidade === 1 ? "lançamento" : "lançamentos"} ·{" "}
              {categoria.tipo === "entrada" ? "Entrada" : "Saída"}
            </Text>
          </View>
          <NumeroAnimado
            valor={categoria.total}
            prefixo={prefixo}
            className="text-xl font-semibold"
            style={{ color: corTipo }}
          />
        </View>

        <View className="flex-row flex-wrap gap-2 mt-3">
          <View
            className="rounded-full px-2.5 py-1 border"
            style={{ borderColor: corTrend + "55", backgroundColor: corTrend + "18" }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: corTrend }}
            >
              {formatarDeltaPct(categoria.deltaPercentual)}
            </Text>
          </View>
          <View
            className="rounded-full px-2.5 py-1 border"
            style={{ borderColor: corTrend + "55", backgroundColor: corTrend + "18" }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: corTrend }}
            >
              {formatarDeltaQtd(categoria.deltaQuantidade)}
            </Text>
          </View>
        </View>
      </Cartao>
    </MotiPressable>
  );
}
