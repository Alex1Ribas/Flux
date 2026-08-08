import { View, Text, TouchableOpacity } from "react-native";

import { Selo } from "@/shared/components";
import { useEstiloSuperficie } from "@/shared/estiloSuperficie";
import { useCores } from "@/shared/tema";
import { obterNomeCaixa } from "@/shared/catalogoCaixas";
import { ArrowDown, ArrowUp, X } from "@/shared/icons";
import { formatBRL, getCompetenciaLabel } from "@/utils/helpers";
import type { CaixaCatalogoItem, Lancamento } from "@/types/flux";

interface ItemLancamentoProps {
  caixasCatalogo: CaixaCatalogoItem[];
  lancamento: Lancamento;
  onExcluir?: () => void;
  somenteLeitura?: boolean;
}

export function ItemLancamento({
  caixasCatalogo,
  lancamento,
  onExcluir,
  somenteLeitura = false,
}: ItemLancamentoProps) {
  const cores = useCores();
  const superficie = useEstiloSuperficie();
  const isEntrada = lancamento.tipo === "entrada";
  const corIcone = isEntrada ? cores.success : cores.error;
  const caixasDestino = lancamento.distribuicao ?? [];
  const caixaId = isEntrada ? caixasDestino[0]?.caixa : lancamento.caixaOrigem;
  const caixaLabel =
    isEntrada && caixasDestino.length > 1
      ? `${caixasDestino.length} caixas`
      : caixaId
        ? obterNomeCaixa(caixasCatalogo, caixaId)
        : null;
  const DirectionIcon = isEntrada ? ArrowUp : ArrowDown;

  return (
    <View
      className="rounded-3xl p-4 mb-3 border flex-row items-center gap-3"
      style={superficie}
    >
      <View className="rounded-2xl p-2 items-center justify-center bg-surface2 border border-border">
        <DirectionIcon
          size={20}
          color={corIcone}
          strokeWidth={2}
        />
      </View>
      <View className="flex-1">
        <Text
          className="text-text text-lg font-medium"
          numberOfLines={1}
        >
          {lancamento.descricao}
        </Text>
        <View className="flex-row items-center gap-1.5 mt-0.5">
          <Selo
            label={lancamento.horizonte === "presente" ? "Presente" : "Futuro"}
            color={
              lancamento.horizonte === "presente" ? cores.text : cores.textMuted
            }
            bg={cores.surface2}
          />
          {caixaId ? (
            <Selo
              label={caixaLabel ?? caixaId}
              color={cores.textMuted}
              bg={cores.surface2}
            />
          ) : null}
          {lancamento.parcelaNum ? (
            <Selo
              label={`${lancamento.parcelaNum}/${lancamento.totalParcelas}`}
              color={cores.textMuted}
              bg={cores.surface2}
            />
          ) : null}
        </View>
      </View>
      <View className="items-end">
        <Text className="text-lg font-medium text-text">
          {isEntrada ? "+" : "−"}
          {formatBRL(lancamento.valor)}
        </Text>
        <Text className="text-textMuted text-base mt-1">
          {getCompetenciaLabel(lancamento.competencia)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onExcluir}
        className="p-1"
        disabled={somenteLeitura || !onExcluir}
        style={{ opacity: somenteLeitura ? 0 : 1 }}
      >
        <X
          size={22}
          color={cores.textFaint}
          strokeWidth={2}
        />
      </TouchableOpacity>
    </View>
  );
}
