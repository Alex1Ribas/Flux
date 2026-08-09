import { Text, View } from "react-native";

import { BarraProgresso, Cartao } from "@/shared/components";
import { getConfigVisualRisco } from "@/service/painel";
import { useCores } from "@/shared/tema";
import type { AcompanhamentoMes } from "@/types/flux";
import { formatBRL } from "@/utils/helpers";

interface ResumoSaudeMesProps {
  dados: AcompanhamentoMes;
}

/** Status primeiro; percentual como apoio — mesma regra de risco do Acompanhamento. */
export function ResumoSaudeMes({ dados }: ResumoSaudeMesProps) {
  const cores = useCores();
  const visual = getConfigVisualRisco(dados.status, cores);
  const IconeStatus = visual.Icon;

  return (
    <Cartao
      className="mb-4"
      style={{ backgroundColor: visual.bg, borderColor: visual.color + "44" }}
    >
      <Text className="text-textMuted text-xs font-semibold uppercase tracking-wide mb-3">
        Saúde do mês
      </Text>

      <View className="flex-row items-center gap-2 mb-3">
        <IconeStatus
          size={22}
          color={visual.color}
          strokeWidth={2}
        />
        <Text
          className="text-3xl font-semibold"
          style={{ color: visual.color }}
        >
          {visual.label}
        </Text>
      </View>

      <Text className="text-text text-md mb-2">
        {formatBRL(dados.risco.comprometido)} comprometidos de{" "}
        {formatBRL(dados.risco.entradaPrevista)} previstos
      </Text>

      <BarraProgresso
        valor={dados.risco.comprometido}
        max={dados.risco.entradaPrevista || 1}
        color={visual.color}
      />

      <Text className="text-textMuted text-sm mt-2">
        {dados.risco.risco.toFixed(1)}% do previsto comprometido
      </Text>
    </Cartao>
  );
}
