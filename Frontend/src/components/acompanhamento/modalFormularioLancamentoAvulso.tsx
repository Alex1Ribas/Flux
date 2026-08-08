import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Botao, Campo, CampoData, SeletorCaixa } from "@/shared/components";
import { useCores, useVarsTema } from "@/shared/tema";
import type { FormularioLancamentoAvulso } from "@/service/acompanhamento";
import type { CaixaCatalogoItem } from "@/types/flux";

interface ModalFormularioLancamentoAvulsoProps {
  visivel: boolean;
  formulario: FormularioLancamentoAvulso;
  caixasCatalogo: CaixaCatalogoItem[];
  erro: string;
  salvando?: boolean;
  onFechar: () => void;
  onSalvar: () => void;
  onAtualizarCampo: (campo: keyof FormularioLancamentoAvulso, valor: string) => void;
}

export function ModalFormularioLancamentoAvulso({
  visivel,
  formulario,
  caixasCatalogo,
  erro,
  salvando = false,
  onFechar,
  onSalvar,
  onAtualizarCampo,
}: ModalFormularioLancamentoAvulsoProps) {
  const varsTema = useVarsTema();
  const cores = useCores();
  const rotuloTipo = formulario.tipo === "entrada" ? "Entrada" : "Saída";
  const rotuloCaixa =
    formulario.tipo === "entrada" ? "Caixa de destino" : "Caixa de origem";

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
          keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
        >
          <Pressable
            className="flex-1 bg-black/70 justify-end"
            onPress={onFechar}
          >
            <Pressable
              onPress={(evento) => evento.stopPropagation()}
              className="bg-bg rounded-t-3xl border border-border max-h-[92%]"
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingTop: 20,
                  paddingBottom: 32,
                }}
              >
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-text text-lg font-medium">Editar lançamento</Text>
                  <View
                    className="px-2.5 py-1 rounded-lg border border-border bg-surface2"
                  >
                    <Text
                      className="text-xs font-medium"
                      style={{ color: cores.textMuted }}
                    >
                      {rotuloTipo}
                    </Text>
                  </View>
                </View>

                <Campo
                  label="Motivo"
                  value={formulario.descricao}
                  onChangeText={(valor) => onAtualizarCampo("descricao", valor)}
                  placeholder="Ex.: Mercado, Freelance..."
                />

                <SeletorCaixa
                  caixasCatalogo={caixasCatalogo}
                  selecionado={formulario.caixaId}
                  onSelect={(caixaId) => onAtualizarCampo("caixaId", caixaId)}
                  label={rotuloCaixa}
                />

                <Campo
                  label="Valor (R$)"
                  value={formulario.valorTexto}
                  onChangeText={(valor) => onAtualizarCampo("valorTexto", valor)}
                  keyboardType="numeric"
                  placeholder="R$ 0,00"
                />

                <CampoData
                  label="Data"
                  value={formulario.competencia}
                  onChange={(dataIso) => onAtualizarCampo("competencia", dataIso)}
                  placeholder="Selecionar data"
                />

                {erro ? (
                  <Text className="text-error text-[11px] mb-3 text-center">{erro}</Text>
                ) : null}

                <View className="flex-row gap-2.5 mt-1">
                  <Botao
                    label="Cancelar"
                    onPress={onFechar}
                    variant="secondary"
                    style={{ flex: 1 }}
                  />
                  <Botao
                    label={salvando ? "Salvando..." : "Salvar"}
                    onPress={onSalvar}
                    variant="primary"
                    style={{ flex: 1 }}
                  />
                </View>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
