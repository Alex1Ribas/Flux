import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { useCores, useVarsTema } from "@/shared/tema";
import type { Lancamento } from "@/types/flux";
import { formatBRL, getCompetenciaLabel } from "@/utils/helpers";

interface ModalExtratoCategoriaProps {
  visivel: boolean;
  titulo: string;
  lancamentos: Lancamento[];
  onFechar: () => void;
  onPressLancamento?: (lancamentoId: string) => void;
}

export function ModalExtratoCategoria({
  visivel,
  titulo,
  lancamentos,
  onFechar,
  onPressLancamento,
}: ModalExtratoCategoriaProps) {
  const cores = useCores();
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
        <Pressable
          className="flex-1 bg-black/70 justify-end"
          onPress={onFechar}
        >
          <Pressable
            onPress={(evento) => evento.stopPropagation()}
            className="bg-bg rounded-t-3xl border border-border max-h-[75%]"
          >
            <View className="px-4 pt-5 pb-3 border-b border-border flex-row justify-between items-center">
              <View className="flex-1 pr-3">
                <Text className="text-text text-2xl font-medium">{titulo}</Text>
                <Text className="text-textMuted text-sm mt-1">
                  {lancamentos.length}{" "}
                  {lancamentos.length === 1 ? "lançamento" : "lançamentos"} no mês
                </Text>
              </View>
              <Pressable
                onPress={onFechar}
                accessibilityRole="button"
                accessibilityLabel="Fechar extrato"
                className="px-3 py-2"
              >
                <Text className="text-textMuted text-md font-medium">Fechar</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerClassName="px-4 py-3 pb-8"
              keyboardShouldPersistTaps="handled"
            >
              {lancamentos.length === 0 ? (
                <Text className="text-textMuted text-md text-center py-8">
                  Nenhum lançamento nesta categoria
                </Text>
              ) : (
                lancamentos.map((lancamento) => {
                  const cor =
                    lancamento.tipo === "entrada" ? cores.success : cores.error;
                  const prefixo = lancamento.tipo === "entrada" ? "+" : "−";
                  const editavel = !lancamento.recorrente && Boolean(onPressLancamento);

                  const conteudo = (
                    <>
                      <View className="flex-1">
                        <Text
                          className="text-text text-md font-medium"
                          numberOfLines={2}
                        >
                          {lancamento.descricao}
                        </Text>
                        <Text className="text-textMuted text-sm mt-1">
                          {getCompetenciaLabel(lancamento.competencia)}
                          {lancamento.observacao ? ` · ${lancamento.observacao}` : ""}
                          {lancamento.recorrente ? " · recorrente" : ""}
                        </Text>
                      </View>
                      <Text
                        className="text-md font-semibold"
                        style={{ color: cor }}
                      >
                        {prefixo}
                        {formatBRL(lancamento.valor)}
                      </Text>
                    </>
                  );

                  if (!editavel) {
                    return (
                      <View
                        key={lancamento.id}
                        className="bg-surface border border-border rounded-2xl px-3 py-3 mb-2 flex-row justify-between items-center gap-3"
                      >
                        {conteudo}
                      </View>
                    );
                  }

                  return (
                    <Pressable
                      key={lancamento.id}
                      onPress={() => onPressLancamento?.(lancamento.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Editar lançamento ${lancamento.descricao}`}
                      className="bg-surface border border-border rounded-2xl px-3 py-3 mb-2 flex-row justify-between items-center gap-3"
                    >
                      {conteudo}
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </View>
    </Modal>
  );
}
