import { View, Text } from "react-native";

import { Cartao, BarraProgresso } from "@/shared/components";
import {
  limiteDiarioOrcamento,
  limiteSemanalOrcamento,
  prazoEstimadoMeses,
} from "@/shared/catalogoCaixas";
import { useCores } from "@/shared/tema";
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
  comprometido?: number;
  disponivel?: number;
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
  comprometido = 0,
  disponivel,
}: CartaoCaixaProps) {
  const cores = useCores();
  const isObjetivo = tipo === "objetivo";
  const isOrigem = tipo === "origem";
  const disponivelValor =
    disponivel !== undefined ? disponivel : saldo - (Number(comprometido) || 0);
  const metaValor = Number(meta) || 0;
  const orcamentoValor = Number(orcamentoMensal) || 0;
  const faltam = isObjetivo ? Math.max(0, metaValor - saldo) : 0;
  const prazo = isObjetivo ? prazoEstimadoMeses(metaValor, aporteMensal) : 0;

  return (
    <Cartao>
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center gap-2 flex-1 pr-2">
          <View className="rounded-2xl p-1.5 bg-surface2 border border-border">
            <CaixaIcon
              id={id}
              indice={indice}
              size={18}
              color={cores.textMuted}
            />
          </View>
          <View className="flex-1">
            <Text
              className="text-textMuted text-sm font-medium uppercase tracking-wide"
              numberOfLines={1}
            >
              {nome}
            </Text>
            <Text className="text-textMuted text-xs mt-0.5">
              {isOrigem ? "Origem" : isObjetivo ? "Objetivo" : "Orçamento"}
            </Text>
          </View>
        </View>
        <Text className="text-text text-3xl font-semibold">{formatBRL(saldo)}</Text>
      </View>

      {!isOrigem && Number(comprometido) > 0 ? (
        <Text className="text-textMuted text-sm mb-2">
          Comprometido {formatBRL(comprometido)} · disponível {formatBRL(disponivelValor)}
        </Text>
      ) : null}

      {isObjetivo && metaValor > 0 ? (
        <>
          <BarraProgresso
            valor={saldo}
            max={metaValor}
            color={cores.primary}
          />
          <Text className="text-textMuted text-md mt-1">
            Meta {formatBRL(metaValor)} · aporte {formatBRL(aporteMensal)}/mês
          </Text>
          <Text className="text-textMuted text-md mt-1">
            {faltam > 0
              ? `Faltam ${formatBRL(faltam)} · prazo ~${prazo} ${prazo === 1 ? "mês" : "meses"}`
              : "Meta alcançada"}
          </Text>
        </>
      ) : null}

      {!isObjetivo && orcamentoValor > 0 ? (
        <>
          <BarraProgresso
            valor={saldo}
            max={orcamentoValor}
            color={cores.primary}
          />
          <Text className="text-textMuted text-md mt-1">
            Orçamento mensal {formatBRL(orcamentoValor)}
          </Text>
          <Text className="text-textMuted text-md mt-1">
            Diário {formatBRL(limiteDiarioOrcamento(orcamentoValor, diasNoMes))} · semanal{" "}
            {formatBRL(limiteSemanalOrcamento(orcamentoValor))}
          </Text>
        </>
      ) : null}
    </Cartao>
  );
}
