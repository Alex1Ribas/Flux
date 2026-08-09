import { Pressable, Text, View } from "react-native";

import { Cartao, NumeroAnimado } from "@/shared/components";
import { feedbackTactilLeve } from "@/shared/feedbackTactil";
import { useCores } from "@/shared/tema";
import type { ResumoCategoriaMes } from "@/service/painel/agruparCategoriasMes";

interface CartaoCategoriaPainelProps {
  categoria: ResumoCategoriaMes;
  onPress: () => void;
}

function formatarTendenciaUnificada(deltaPercentual: number, deltaQuantidade: number): string {
  const absPct = Math.abs(deltaPercentual).toFixed(0);
  const absQtd = Math.abs(deltaQuantidade);
  const label = absQtd === 1 ? "item" : "itens";

  let seta = "→";
  if (deltaPercentual > 0 || (Math.abs(deltaPercentual) < 0.5 && deltaQuantidade > 0)) {
    seta = "↑";
  } else if (deltaPercentual < 0 || deltaQuantidade < 0) {
    seta = "↓";
  }

  return `${seta} ${absPct}% (${absQtd} ${label})`;
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
      accessibilityLabel={`Detalhar ${categoria.nome}`}
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
                color: corTrend,
                fontSize: 12,
                marginTop: 4,
                fontWeight: "500",
              }}
            >
              {formatarTendenciaUnificada(
                categoria.deltaPercentual,
                categoria.deltaQuantidade
              )}
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
      </Cartao>
    </Pressable>
  );
}
