import { View, Text } from "react-native";
import { Cartao, BarraProgresso } from "@/shared/components";
import {
  limiteDiarioOrcamento,
  limiteSemanalOrcamento,
  prazoEstimadoMeses,
} from "@/shared/catalogoCaixas";
import { COLORS } from "@/shared/tokensDesign";
import { CaixaIcon } from "@/shared/icons";
import { formatBRL } from "@/utils/helpers";
import type { CaixaId } from "@/shared/estilosCaixa";
import type { TipoCaixa } from "@/types/flux";

interface CartaoCaixaProps {
  id: CaixaId;
  nome: string;
  saldo: number;
  indice?: number;
  tipo?: TipoCaixa;
  meta?: number;
  aporteMensal?: number;
  orcamentoMensal?: number;
  diasNoMes?: number;
}

export function CartaoCaixa({
  id,
  nome,
  saldo,
  indice = 0,
  tipo = "orcamento",
  meta = 0,
  aporteMensal = 0,
  orcamentoMensal = 0,
  diasNoMes = 30,
}: CartaoCaixaProps) {
  const isObjetivo = tipo === "objetivo";
  const faltam = isObjetivo ? Math.max(0, meta - saldo) : 0;
  const prazo = isObjetivo ? prazoEstimadoMeses(meta, aporteMensal) : 0;

  return (
    <Cartao>
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center gap-2 flex-1 pr-2">
          <View className="rounded-2xl p-1.5 bg-surface2 border border-border">
            <CaixaIcon
              id={id}
              indice={indice}
              size={18}
              color={COLORS.textMuted}
            />
          </View>
          <View className="flex-1">
            <Text
              className="text-textMuted text-md font-medium uppercase tracking-wide"
              numberOfLines={1}
            >
              {nome}
            </Text>
            <Text className="text-textMuted text-md mt-0.5">
              {isObjetivo ? "Objetivo" : "Orçamento"}
            </Text>
          </View>
        </View>
        <Text className="text-text text-2xl font-medium">{formatBRL(saldo)}</Text>
      </View>

      {isObjetivo && meta > 0 ? (
        <>
          <BarraProgresso
            valor={saldo}
            max={meta}
            color={COLORS.text}
          />
          <Text className="text-textMuted text-md mt-1">
            Meta {formatBRL(meta)} · aporte {formatBRL(aporteMensal)}/mês
          </Text>
          <Text className="text-textMuted text-md mt-1">
            {faltam > 0
              ? `Faltam ${formatBRL(faltam)} · prazo ~${prazo} ${prazo === 1 ? "mês" : "meses"}`
              : "Meta alcançada"}
          </Text>
        </>
      ) : null}

      {!isObjetivo && orcamentoMensal > 0 ? (
        <>
          <BarraProgresso
            valor={saldo}
            max={orcamentoMensal}
            color={COLORS.text}
          />
          <Text className="text-textMuted text-md mt-1">
            Orçamento mensal {formatBRL(orcamentoMensal)}
          </Text>
          <Text className="text-textMuted text-md mt-1">
            Diário {formatBRL(limiteDiarioOrcamento(orcamentoMensal, diasNoMes))} · semanal{" "}
            {formatBRL(limiteSemanalOrcamento(orcamentoMensal))}
          </Text>
        </>
      ) : null}
    </Cartao>
  );
}
