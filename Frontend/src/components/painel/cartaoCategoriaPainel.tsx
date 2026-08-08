import { Pressable, Text, View } from "react-native";

import { Cartao, NumeroAnimado } from "@/shared/components";
import { feedbackTactilLeve } from "@/shared/feedbackTactil";
import { useCores } from "@/shared/tema";
import type { ResumoCategoriaMes } from "@/service/painel/agruparCategoriasMes";

interface CartaoCategoriaPainelProps {
  categoria: ResumoCategoriaMes;
  onPress: () => void;
}

function formatarDeltaPct(valor: number): string {
  const abs = Math.abs(valor);
  if (valor > 0) return `↑ ${abs.toFixed(0)}% vs mês passado`;
  if (valor < 0) return `↓ ${abs.toFixed(0)}% vs mês passado`;
  return `→ ${abs.toFixed(0)}% vs mês passado`;
}

function formatarDeltaQtd(valor: number): string {
  const abs = Math.abs(valor);
  const label = abs === 1 ? "item" : "itens";
  if (valor === 0) return `→ 0 ${label} vs mês passado`;
  if (valor > 0) return `↑ ${abs} ${label} vs mês passado`;
  return `↓ ${abs} ${label} vs mês passado`;
}

export function CartaoCategoriaPainel({ categoria, onPress }: CartaoCategoriaPainelProps) {
  const cores = useCores();
  const corTipo = categoria.tipo === "entrada" ? cores.success : cores.error;

  let corTrend = cores.success;
  if (categoria.deltaQuantidade === 0 && Math.abs(categoria.deltaPercentual) < 0.5) {
    corTrend = cores.textMuted;
  } else if (categoria.tendenciaNegativa) {
    corTrend = cores.error;
  }

  const prefixo = categoria.tipo === "entrada" ? "+" : "−";

  return (
    <Pressable
      onPress={() => {
        void feedbackTactilLeve();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={`Detalhar categoria ${categoria.nome}`}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.95 : 1 }],
      })}
    >
      <Cartao className="mb-2">
        <View className="flex-row justify-between items-start gap-3">
          <View className="flex-1">
            <Text
              numberOfLines={1}
              style={{
                color: cores.text,
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              {categoria.nome}
            </Text>
            <Text
              style={{
                color: cores.textMuted,
                fontSize: 12,
                marginTop: 4,
              }}
            >
              {categoria.quantidade}{" "}
              {categoria.quantidade === 1 ? "lançamento" : "lançamentos"} ·{" "}
              {categoria.tipo === "entrada" ? "Entrada" : "Saída"}
            </Text>
          </View>
          <NumeroAnimado
            valor={categoria.total}
            prefixo={prefixo}
            style={{ color: corTipo, fontSize: 18, fontWeight: "600" }}
          />
        </View>

        <View className="flex-row flex-wrap gap-2 mt-3">
          <View
            className="rounded-full px-2.5 py-1 border"
            style={{ borderColor: corTrend + "55", backgroundColor: corTrend + "18" }}
          >
            <Text
              style={{
                color: corTrend,
                fontSize: 11,
                fontWeight: "600",
              }}
            >
              {formatarDeltaPct(categoria.deltaPercentual)}
            </Text>
          </View>
          <View
            className="rounded-full px-2.5 py-1 border"
            style={{ borderColor: corTrend + "55", backgroundColor: corTrend + "18" }}
          >
            <Text
              style={{
                color: corTrend,
                fontSize: 11,
                fontWeight: "600",
              }}
            >
              {formatarDeltaQtd(categoria.deltaQuantidade)}
            </Text>
          </View>
        </View>
      </Cartao>
    </Pressable>
  );
}
