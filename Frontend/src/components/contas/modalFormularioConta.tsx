import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Botao, Campo, CampoData, SeletorCaixa, TituloSecao } from "@/shared/components";
import { useVarsTema } from "@/shared/tema";
import type { FormularioConta } from "@/service/contas";
import type { CaixaCatalogoItem } from "@/types/flux";

function rotuloBotaoConta(salvando: boolean, editando: boolean): string {
  if (salvando) return "Salvando...";
  if (editando) return "Salvar";
  return "Criar conta";
}

interface ModalFormularioContaProps {
  visivel: boolean;
  editando: boolean;
  formulario: FormularioConta;
  caixasCatalogo: CaixaCatalogoItem[];
  erro: string;
  salvando: boolean;
  onFechar: () => void;
  onSalvar: () => void;
  onExcluir?: () => void;
  onAtualizarCampo: (campo: keyof FormularioConta, valor: string) => void;
}

export function ModalFormularioConta({
  visivel,
  editando,
  formulario,
  caixasCatalogo,
  erro,
  salvando,
  onFechar,
  onSalvar,
  onExcluir,
  onAtualizarCampo,
}: ModalFormularioContaProps) {
  const varsTema = useVarsTema();

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
                <Text className="text-text text-lg font-medium mb-4">
                  {editando ? "Editar conta" : "Nova conta"}
                </Text>

                <TituloSecao title="Tipo" />
                <View className="flex-row gap-2 mb-3">
                  <Botao
                    label="A pagar"
                    onPress={() => onAtualizarCampo("tipo", "a_pagar")}
                    variant={formulario.tipo === "a_pagar" ? "primary" : "secondary"}
                    style={{ flex: 1 }}
                  />
                  <Botao
                    label="A receber"
                    onPress={() => onAtualizarCampo("tipo", "a_receber")}
                    variant={formulario.tipo === "a_receber" ? "primary" : "secondary"}
                    style={{ flex: 1 }}
                  />
                </View>

                <Campo
                  label="Descrição"
                  value={formulario.descricao}
                  onChangeText={(valor) => onAtualizarCampo("descricao", valor)}
                  placeholder="Ex.: Aluguel, Cliente..."
                />

                <Campo
                  label="Valor previsto"
                  value={formulario.valorTexto}
                  onChangeText={(valor) => onAtualizarCampo("valorTexto", valor)}
                  keyboardType="decimal-pad"
                  placeholder="0,00"
                />

                <CampoData
                  label="Vencimento"
                  value={formulario.vencimento}
                  onChange={(valor) => onAtualizarCampo("vencimento", valor)}
                />

                <SeletorCaixa
                  caixasCatalogo={caixasCatalogo}
                  selecionado={formulario.caixaId}
                  onSelect={(caixaId) => onAtualizarCampo("caixaId", caixaId)}
                  label={
                    formulario.tipo === "a_receber"
                      ? "Para onde vai o dinheiro?"
                      : "De onde sai o dinheiro?"
                  }
                />

                {erro ? (
                  <Text className="text-error text-xs mb-3">{erro}</Text>
                ) : null}

                <Botao
                  label={rotuloBotaoConta(salvando, editando)}
                  onPress={onSalvar}
                  variant="primary"
                  disabled={salvando}
                />

                {editando && onExcluir ? (
                  <Botao
                    label="Excluir"
                    onPress={onExcluir}
                    variant="secondary"
                    style={{ marginTop: 8 }}
                    disabled={salvando}
                  />
                ) : null}
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
