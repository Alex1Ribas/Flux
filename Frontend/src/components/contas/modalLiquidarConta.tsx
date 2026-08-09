import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Botao, CampoData, SeletorCaixa } from "@/shared/components";
import { useCores, useVarsTema } from "@/shared/tema";
import { AlertTriangle } from "@/shared/icons";
import type { FormularioLiquidacaoConta } from "@/service/contas";
import type { CaixaCatalogoItem, Conta } from "@/types/flux";
import { formatBRL, formatarCompetencia } from "@/utils/helpers";

function rotuloBotaoLiquidar(salvando: boolean, eAPagar: boolean): string {
  if (salvando) return "Salvando...";
  if (eAPagar) return "Confirmar pagamento";
  return "Confirmar recebimento";
}

interface ModalLiquidarContaProps {
  visivel: boolean;
  conta: Conta | null;
  formulario: FormularioLiquidacaoConta;
  caixasCatalogo: CaixaCatalogoItem[];
  precisaCompensacao: boolean;
  estouro: number;
  erro: string;
  salvando: boolean;
  onFechar: () => void;
  onLiquidar: () => void;
  onAtualizarCampo: (campo: keyof FormularioLiquidacaoConta, valor: string) => void;
}

export function ModalLiquidarConta({
  visivel,
  conta,
  formulario,
  caixasCatalogo,
  precisaCompensacao,
  estouro,
  erro,
  salvando,
  onFechar,
  onLiquidar,
  onAtualizarCampo,
}: ModalLiquidarContaProps) {
  const varsTema = useVarsTema();
  const cores = useCores();
  if (!conta) return null;

  const eAPagar = conta.tipo === "a_pagar";

  return (
    <Modal
      transparent
      visible={visivel}
      animationType="slide"
      onRequestClose={onFechar}
    >
      <View
        style={[{ flex: 1 }, varsTema]}
        className="flex-1"
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Pressable
            className="flex-1 bg-black/70 justify-end"
            onPress={onFechar}
          >
            <Pressable
              onPress={(evento) => evento.stopPropagation()}
              className="bg-bg rounded-t-3xl border border-border"
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingTop: 20,
                  paddingBottom: 32,
                }}
              >
                <Text className="text-text text-lg font-medium mb-1">
                  {eAPagar ? "Registrar pagamento" : "Registrar recebimento"}
                </Text>
                <Text className="text-textMuted text-xs mb-4 leading-4">
                  {conta.descricao} · previsto {formatBRL(conta.valor)} · vencimento{" "}
                  {formatarCompetencia(conta.vencimento)}
                </Text>

                <CampoData
                  label={eAPagar ? "Pago em" : "Recebido em"}
                  value={formulario.liquidadoEm}
                  onChange={(valor) => onAtualizarCampo("liquidadoEm", valor)}
                />

                <SeletorCaixa
                  caixasCatalogo={caixasCatalogo}
                  selecionado={formulario.caixaId}
                  onSelect={(caixaId) => onAtualizarCampo("caixaId", caixaId)}
                  label={
                    eAPagar ? "De onde sai o dinheiro?" : "Para onde vai o dinheiro?"
                  }
                />

                {precisaCompensacao ? (
                  <View
                    className="mb-4 p-4 rounded-3xl border"
                    style={{
                      backgroundColor: cores.errorHighlight,
                      borderColor: cores.error + "55",
                    }}
                  >
                    <View className="flex-row items-center gap-2 mb-3">
                      <AlertTriangle
                        size={18}
                        color={cores.error}
                        strokeWidth={2}
                      />
                      <Text
                        className="text-md font-semibold"
                        style={{ color: cores.error }}
                      >
                        Estouro: {formatBRL(estouro)}
                      </Text>
                    </View>
                    <SeletorCaixa
                      caixasCatalogo={caixasCatalogo}
                      selecionado={formulario.caixaCompensacao}
                      onSelect={(caixaId) => onAtualizarCampo("caixaCompensacao", caixaId)}
                      excluir={formulario.caixaId}
                      label="Caixa de compensação"
                    />
                  </View>
                ) : null}

                <Text className="text-textMuted text-[11px] mb-3 leading-4">
                  Isso gera uma {eAPagar ? "saída" : "entrada"} real nas caixas.
                </Text>

                {erro ? (
                  <Text className="text-error text-xs mb-3">{erro}</Text>
                ) : null}

                <Botao
                  label={rotuloBotaoLiquidar(salvando, eAPagar)}
                  onPress={onLiquidar}
                  variant="primary"
                  disabled={salvando}
                />
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
