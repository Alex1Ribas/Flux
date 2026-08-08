import { View, Text } from "react-native";

import { Cartao, BarraProgresso, NumeroAnimado } from "@/shared/components";
import { getConfigVisualRisco } from "@/entities/painel";
import { useCores } from "@/shared/tema";
import type { AcompanhamentoMes } from "@/types/flux";
import { formatBRL } from "@/utils/helpers";

interface IndicadorRiscoPrincipalProps {
  dados: AcompanhamentoMes;
}

/** Bloco A: risco mensal só com recorrente === true. */
export function IndicadorRiscoPrincipal({ dados }: IndicadorRiscoPrincipalProps) {
  const cores = useCores();
  const visual = getConfigVisualRisco(dados.status, cores);
  const IconeStatus = visual.Icon;

  return (
    <Cartao style={{ backgroundColor: visual.bg, borderColor: visual.color + "44" }}>
      <Text className="text-textMuted text-xs mb-2 uppercase tracking-wide">
        Resumo do risco mensal
      </Text>
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center gap-2">
          <NumeroAnimado
            valor={dados.risco.risco}
            formatar={(n) => `${n.toFixed(1)}%`}
            className="text-8xl font-light"
            style={{ color: visual.color }}
          />
          <IconeStatus
            size={20}
            color={visual.color}
            strokeWidth={2}
          />
        </View>
        <Text
          className="text-2xl font-semibold"
          style={{ color: visual.color }}
        >
          {visual.label}
        </Text>
      </View>
      <BarraProgresso
        valor={dados.risco.comprometido}
        max={dados.risco.entradaPrevista || 1}
        color={visual.color}
      />
      <Text className="text-textMuted text-md mt-2">
        {formatBRL(dados.risco.comprometido)} comprometidos de{" "}
        {formatBRL(dados.risco.entradaPrevista)} previstos
      </Text>
    </Cartao>
  );
}
