import { Pressable, Text, View } from "react-native";

import { Botao, Campo, CampoData, Cartao, SeletorCaixa } from "@/shared/components";
import { useCores } from "@/shared/tema";
import type { CaixaCatalogoItem, ModoCompensacaoSimulacao } from "@/types/flux";

interface FonteCompensacaoView {
  id: string;
  tipoOrigem: "orcamento" | "objetivo";
  origemId: string;
  valorMensalDestinado: string;
}

interface FormularioSimulacaoProps {
  valorTotal: string;
  duracaoMeses: string;
  dataPrimeiroPagamento: string;
  modoCompensacao: ModoCompensacaoSimulacao;
  fontes: FonteCompensacaoView[];
  fontesCompativeis: CaixaCatalogoItem[];
  onChangeValorTotal: (value: string) => void;
  onChangeDuracaoMeses: (value: string) => void;
  onChangeDataPrimeiroPagamento: (value: string) => void;
  onChangeModoCompensacao: (modo: ModoCompensacaoSimulacao) => void;
  onAdicionarFonte: () => void;
  onRemoverFonte: (id: string) => void;
  onAtualizarFonte: (
    id: string,
    campo: keyof FonteCompensacaoView,
    value: string,
  ) => void;
}

export function FormularioSimulacao({
  valorTotal,
  duracaoMeses,
  dataPrimeiroPagamento,
  modoCompensacao,
  fontes,
  fontesCompativeis,
  onChangeValorTotal,
  onChangeDuracaoMeses,
  onChangeDataPrimeiroPagamento,
  onChangeModoCompensacao,
  onAdicionarFonte,
  onRemoverFonte,
  onAtualizarFonte,
}: FormularioSimulacaoProps) {
  const cores = useCores();

  return (
    <Cartao className="mb-3">
      <Text className="text-text text-sm font-semibold mb-3">Cenário da simulação</Text>

      <Campo
        label="Valor total do compromisso"
        value={valorTotal}
        onChangeText={onChangeValorTotal}
        keyboardType="decimal-pad"
        placeholder="Ex.: 4800"
      />

      <Campo
        label="Duração em meses"
        value={duracaoMeses}
        onChangeText={onChangeDuracaoMeses}
        keyboardType="number-pad"
        placeholder="Ex.: 12"
      />

      <CampoData
        label="Data do primeiro pagamento"
        value={dataPrimeiroPagamento}
        onChange={onChangeDataPrimeiroPagamento}
      />

      <View className="mb-2">
        <Text className="text-textMuted text-2xl mb-1 font-medium">Modo de compensação</Text>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => onChangeModoCompensacao("nao-declarada")}
            className="flex-1 px-3 py-2.5 rounded-xl border"
            style={{
              borderColor: modoCompensacao === "nao-declarada" ? cores.primary : cores.border,
              backgroundColor:
                modoCompensacao === "nao-declarada"
                  ? cores.primaryHighlight
                  : cores.surface,
            }}
          >
            <Text className="text-text text-xs font-semibold text-center">Impacto bruto</Text>
          </Pressable>
          <Pressable
            onPress={() => onChangeModoCompensacao("declarada")}
            className="flex-1 px-3 py-2.5 rounded-xl border"
            style={{
              borderColor: modoCompensacao === "declarada" ? cores.primary : cores.border,
              backgroundColor:
                modoCompensacao === "declarada" ? cores.primaryHighlight : cores.surface,
            }}
          >
            <Text className="text-text text-xs font-semibold text-center">
              Fontes declaradas
            </Text>
          </Pressable>
        </View>
      </View>

      {modoCompensacao === "declarada" ? (
        <View className="mt-2">
          <Text className="text-text text-xs font-semibold mb-2">
            Fontes de compensação mensal
          </Text>
          {fontes.map((fonte, indice) => {
            const tipoSelecionado = fonte.tipoOrigem;
            const itensFonte = fontesCompativeis.filter(
              (item) => item.tipo === tipoSelecionado,
            );

            return (
              <View
                key={fonte.id}
                className="mb-2 rounded-xl border border-border p-2"
                style={{ backgroundColor: cores.surface }}
              >
                <Text className="text-textMuted text-[11px] mb-2">Fonte {indice + 1}</Text>
                <View className="flex-row gap-2 mb-2">
                  <Pressable
                    onPress={() => onAtualizarFonte(fonte.id, "tipoOrigem", "orcamento")}
                    className="flex-1 px-2 py-2 rounded-lg border"
                    style={{
                      borderColor:
                        tipoSelecionado === "orcamento" ? cores.primary : cores.border,
                    }}
                  >
                    <Text className="text-text text-xs text-center">Orçamento</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onAtualizarFonte(fonte.id, "tipoOrigem", "objetivo")}
                    className="flex-1 px-2 py-2 rounded-lg border"
                    style={{
                      borderColor:
                        tipoSelecionado === "objetivo" ? cores.primary : cores.border,
                    }}
                  >
                    <Text className="text-text text-xs text-center">Objetivo</Text>
                  </Pressable>
                </View>

                <SeletorCaixa
                  label="Origem"
                  caixasCatalogo={itensFonte}
                  selecionado={fonte.origemId}
                  onSelect={(caixaId) =>
                    onAtualizarFonte(fonte.id, "origemId", caixaId)
                  }
                />

                <Campo
                  label="Valor mensal destinado"
                  value={fonte.valorMensalDestinado}
                  onChangeText={(value) =>
                    onAtualizarFonte(fonte.id, "valorMensalDestinado", value)
                  }
                  keyboardType="decimal-pad"
                  placeholder="Ex.: 200"
                />

                <Botao
                  label="Remover fonte"
                  onPress={() => onRemoverFonte(fonte.id)}
                  variant="ghost"
                />
              </View>
            );
          })}

          <Botao
            label="Adicionar fonte"
            onPress={onAdicionarFonte}
            variant="secondary"
          />
        </View>
      ) : (
        <Text className="text-textMuted text-xs mt-2">
          Modo bruto: o sistema calcula apenas comprometimento futuro, sem distribuir por
          orçamento ou objetivo.
        </Text>
      )}
    </Cartao>
  );
}
