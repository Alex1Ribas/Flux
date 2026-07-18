import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Botao, Campo, SeletorCaixa, TituloSecao } from "@/shared/components";
import type { FormularioItemRecorrente } from "@/service/acompanhamento";
import type { CaixaCatalogoItem } from "@/types/flux";

interface ModalFormularioItemRecorrenteProps {
  visivel: boolean;
  editando: boolean;
  formulario: FormularioItemRecorrente;
  caixasCatalogo: CaixaCatalogoItem[];
  erro: string;
  onFechar: () => void;
  onSalvar: () => void;
  onExcluir?: () => void;
  onAtualizarCampo: (campo: keyof FormularioItemRecorrente, valor: string) => void;
}

/** Mesmo modal de criar/editar item recorrente usado no Acompanhamento. */
export function ModalFormularioItemRecorrente({
  visivel,
  editando,
  formulario,
  caixasCatalogo,
  erro,
  onFechar,
  onSalvar,
  onExcluir,
  onAtualizarCampo,
}: ModalFormularioItemRecorrenteProps) {
  return (
    <Modal
      transparent
      visible={visivel}
      animationType="slide"
      onRequestClose={onFechar}
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
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 }}
            >
              <Text className="text-text text-lg font-medium mb-4">
                {editando ? "Editar item" : "Novo item recorrente"}
              </Text>

              <Campo
                label="Nome"
                value={formulario.nome}
                onChangeText={(valor) => onAtualizarCampo("nome", valor)}
                placeholder="Ex.: Salário, Aluguel..."
              />

              <TituloSecao title="Tipo" />
              <View className="flex-row gap-2 mb-3">
                {(["entrada", "saida"] as const).map((tipoItem) => (
                  <Botao
                    key={tipoItem}
                    label={tipoItem === "entrada" ? "Entrada" : "Saída"}
                    onPress={() => onAtualizarCampo("tipo", tipoItem)}
                    variant={formulario.tipo === tipoItem ? "primary" : "secondary"}
                    style={{ flex: 1 }}
                  />
                ))}
              </View>

              <SeletorCaixa
                caixasCatalogo={caixasCatalogo}
                selecionado={formulario.caixaId}
                onSelect={(caixaId) => onAtualizarCampo("caixaId", caixaId)}
                label={formulario.tipo === "entrada" ? "Caixa de destino" : "Caixa de origem"}
              />

              <Campo
                label="Valor mensal (R$)"
                value={formulario.valorTexto}
                onChangeText={(valor) => onAtualizarCampo("valorTexto", valor)}
                keyboardType="numeric"
                placeholder="R$ 0,00"
              />
              <Campo
                label="Competência inicial (AAAA-MM)"
                value={formulario.competenciaInicial}
                onChangeText={(valor) => onAtualizarCampo("competenciaInicial", valor)}
                placeholder="2026-07"
              />
              <Campo
                label="Duração (meses)"
                value={formulario.duracaoMesesTexto}
                onChangeText={(valor) => onAtualizarCampo("duracaoMesesTexto", valor)}
                keyboardType="numeric"
                placeholder="12"
              />

              {erro ? (
                <Text className="text-error text-[11px] mb-3 text-center">{erro}</Text>
              ) : null}

              <View className="flex-row gap-2.5 mt-1">
                {editando && onExcluir ? (
                  <Botao
                    label="Excluir"
                    onPress={onExcluir}
                    variant="danger"
                    style={{ flex: 1 }}
                  />
                ) : null}
                <Botao
                  label="Cancelar"
                  onPress={onFechar}
                  variant="secondary"
                  style={{ flex: 1 }}
                />
                <Botao
                  label="Salvar"
                  onPress={onSalvar}
                  variant="primary"
                  style={{ flex: 1 }}
                />
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
