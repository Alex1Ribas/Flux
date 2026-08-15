import { useMemo } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { CartaoCaixa } from "@/components/flux/cartaoCaixa";
import { Botao, Campo, ModalConfirmacao, NumeroAnimado } from "@/shared/components";
import { useTelaCaixas } from "@/entities/caixas";
import { useEstiloSuperficie, useFundoTela } from "@/shared/estiloSuperficie";
import { useCores, useVarsTema } from "@/shared/tema";
import { MARCA } from "@/shared/tokensDesign";
import { Plus } from "@/shared/icons";
import { formatBRL, getDiasNoMes, somarCaixas } from "@/utils/helpers";
import type { TelaProps } from "@/types/navigation";

export function TelaCaixas(_props: TelaProps) {
  const tela = useTelaCaixas();
  const totalCaixas = somarCaixas(tela.caixas);
  const diasNoMes = getDiasNoMes(tela.competencia);
  const fundo = useFundoTela();
  const cores = useCores();
  const varsTema = useVarsTema();
  const superficie = useEstiloSuperficie();
  const superficieBotao = useEstiloSuperficie({
    borderRadius: 16,
    padding: 10,
  });

  const { origens, orcamentos, objetivos } = useMemo(() => {
    const origensLista = tela.caixasCatalogo.filter((caixa) => caixa.tipo === "origem");
    const orcamentosLista = tela.caixasCatalogo.filter(
      (caixa) => (caixa.tipo ?? "orcamento") === "orcamento"
    );
    const objetivosLista = tela.caixasCatalogo.filter(
      (caixa) => caixa.tipo === "objetivo"
    );
    return {
      origens: origensLista,
      orcamentos: orcamentosLista,
      objetivos: objetivosLista,
    };
  }, [tela.caixasCatalogo]);

  return (
    <>
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: fundo }}
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-center mb-5 mt-1">
          <View className="flex-1 pr-3">
            <Text
              className="text-sm font-semibold uppercase tracking-wide mb-1"
              style={{ color: cores.primary }}
            >
              {MARCA}
            </Text>
            <Text className="text-text text-4xl font-medium">Caixas</Text>
            <Text className="text-textMuted text-md mt-1">
              Organize a separação do seu dinheiro em objetivos e orçamentos.
            </Text>
          </View>
          <Pressable
            onPress={tela.abrirCriar}
            className="border"
            style={superficieBotao}
            accessibilityRole="button"
            accessibilityLabel="Nova caixa"
          >
            <Plus
              size={20}
              color={cores.text}
              strokeWidth={2}
            />
          </Pressable>
        </View>

        <Text className="text-textMuted text-xs font-semibold uppercase tracking-wide mb-3">
          Origens
        </Text>
        {origens.length === 0 ? (
          <Text className="text-textMuted text-sm mb-5">Nenhuma caixa de origem</Text>
        ) : (
          origens.map((caixa) => {
            const indice = tela.caixasCatalogo.findIndex((item) => item.id === caixa.id);
            return (
              <Pressable
                key={caixa.id}
                onPress={() => tela.abrirEditar(caixa.id)}
                accessibilityRole="button"
                accessibilityLabel={`Editar ${caixa.nome}`}
              >
                <CartaoCaixa
                  id={caixa.id}
                  nome={caixa.nome}
                  saldo={tela.caixas[caixa.id] || 0}
                  indice={indice >= 0 ? indice : 0}
                  tipo={caixa.tipo}
                  comprometido={caixa.comprometido}
                  disponivel={caixa.disponivel}
                  diasNoMes={diasNoMes}
                />
              </Pressable>
            );
          })
        )}

        <Text className="text-textMuted text-xs font-semibold uppercase tracking-wide mb-3 mt-2">
          Orçamentos
        </Text>
        {orcamentos.length === 0 ? (
          <Text className="text-textMuted text-sm mb-5">Nenhum orçamento cadastrado</Text>
        ) : (
          orcamentos.map((caixa) => {
            const indice = tela.caixasCatalogo.findIndex((item) => item.id === caixa.id);
            const orcamentoMensal =
              Number(caixa.orcamentoMensal) ||
              Number(tela.orcamentos[tela.competencia]?.[caixa.id]) ||
              0;
            return (
              <Pressable
                key={caixa.id}
                onPress={() => tela.abrirEditar(caixa.id)}
                accessibilityRole="button"
                accessibilityLabel={`Editar ${caixa.nome}`}
              >
                <CartaoCaixa
                  id={caixa.id}
                  nome={caixa.nome}
                  saldo={tela.caixas[caixa.id] || 0}
                  indice={indice >= 0 ? indice : 0}
                  tipo={caixa.tipo}
                  meta={caixa.meta}
                  aporteMensal={caixa.aporteMensal}
                  orcamentoMensal={orcamentoMensal}
                  comprometido={caixa.comprometido}
                  disponivel={caixa.disponivel}
                  diasNoMes={diasNoMes}
                />
              </Pressable>
            );
          })
        )}

        <Text className="text-textMuted text-xs font-semibold uppercase tracking-wide mb-3 mt-2">
          Objetivos
        </Text>
        {objetivos.length === 0 ? (
          <Text className="text-textMuted text-sm mb-5">Nenhum objetivo cadastrado</Text>
        ) : (
          objetivos.map((caixa) => {
            const indice = tela.caixasCatalogo.findIndex((item) => item.id === caixa.id);
            return (
              <Pressable
                key={caixa.id}
                onPress={() => tela.abrirEditar(caixa.id)}
                accessibilityRole="button"
                accessibilityLabel={`Editar ${caixa.nome}`}
              >
                <CartaoCaixa
                  id={caixa.id}
                  nome={caixa.nome}
                  saldo={tela.caixas[caixa.id] || 0}
                  indice={indice >= 0 ? indice : 0}
                  tipo={caixa.tipo}
                  meta={caixa.meta}
                  aporteMensal={caixa.aporteMensal}
                  orcamentoMensal={caixa.orcamentoMensal}
                  comprometido={caixa.comprometido}
                  disponivel={caixa.disponivel}
                  diasNoMes={diasNoMes}
                />
              </Pressable>
            );
          })
        )}

        <View
          className="rounded-3xl p-4 mt-2 border flex-row justify-between items-center"
          style={superficie}
        >
          <Text className="text-text text-md font-semibold">Total</Text>
          <NumeroAnimado
            valor={totalCaixas}
            className="text-text text-4xl font-medium"
          />
        </View>

        <View className="h-10" />
      </ScrollView>

      <Modal
        transparent
        visible={tela.modalAberto}
        animationType="slide"
        onRequestClose={tela.fecharModal}
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
              onPress={tela.fecharModal}
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
                  <Text className="text-text text-2xl font-medium mb-1">
                    {tela.caixaEditando ? "Editar caixa" : "Nova caixa"}
                  </Text>
                  <Text className="text-textMuted text-md mb-4">
                    Origem (receita), objetivo ou orçamento (alocação)
                  </Text>

                  <View className="flex-row gap-2 mb-4">
                    {(
                      [
                        { id: "origem", label: "Origem" },
                        { id: "objetivo", label: "Objetivo" },
                        { id: "orcamento", label: "Orçamento" },
                      ] as const
                    ).map((opcao) => {
                      const ativo = tela.formulario.tipo === opcao.id;
                      return (
                        <Pressable
                          key={opcao.id}
                          onPress={() => tela.definirTipo(opcao.id)}
                          className="flex-1 rounded-xl border px-3 py-2.5"
                          style={{
                            borderColor: ativo ? cores.text : cores.border,
                            backgroundColor: ativo ? cores.surface2 : cores.surface,
                          }}
                        >
                          <Text
                            className="text-center text-md font-medium"
                            style={{ color: cores.text }}
                          >
                            {opcao.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                <Campo
                  label="Nome"
                  value={tela.formulario.nome}
                  onChangeText={(valor) => tela.atualizarCampo("nome", valor)}
                  placeholder={
                    tela.formulario.tipo === "origem"
                      ? "Ex.: Salário"
                      : tela.formulario.tipo === "objetivo"
                        ? "Ex.: Reserva de Emergência"
                        : "Ex.: Qualidade de Vida"
                  }
                />
                <Campo
                  label="Saldo atual (R$)"
                  value={tela.formulario.saldoTexto}
                  onChangeText={(valor) => tela.atualizarCampo("saldoTexto", valor)}
                  keyboardType="numeric"
                  placeholder="0"
                />

                {tela.formulario.tipo === "origem" ? null : tela.formulario.tipo === "objetivo" ? (
                  <>
                    <Campo
                      label="Valor da meta (R$)"
                      value={tela.formulario.metaTexto}
                      onChangeText={(valor) => tela.atualizarCampo("metaTexto", valor)}
                      keyboardType="numeric"
                      placeholder="1000"
                    />
                    <Campo
                      label="Aporte mensal planejado (R$)"
                      value={tela.formulario.aporteMensalTexto}
                      onChangeText={(valor) => tela.atualizarCampo("aporteMensalTexto", valor)}
                      keyboardType="numeric"
                      placeholder="100"
                    />
                    {tela.prazoEstimado > 0 ? (
                      <Text className="text-textMuted text-md mb-3">
                        Prazo estimado: {tela.prazoEstimado}{" "}
                        {tela.prazoEstimado === 1 ? "mês" : "meses"}
                      </Text>
                    ) : null}
                  </>
                ) : (
                  <>
                    <Campo
                      label="Orçamento mensal (R$)"
                      value={tela.formulario.orcamentoMensalTexto}
                      onChangeText={(valor) =>
                        tela.atualizarCampo("orcamentoMensalTexto", valor)
                      }
                      keyboardType="numeric"
                      placeholder="400"
                    />
                    {tela.limitesOrcamento &&
                    Number(tela.formulario.orcamentoMensalTexto) > 0 ? (
                      <Text className="text-textMuted text-md mb-3">
                        Limite diário {formatBRL(tela.limitesOrcamento.diario)} · semanal{" "}
                        {formatBRL(tela.limitesOrcamento.semanal)}
                      </Text>
                    ) : null}
                  </>
                )}

                {tela.erro ? (
                  <Text className="text-error text-md mb-3 text-center">{tela.erro}</Text>
                ) : null}

                <View className="flex-row gap-2.5 mt-1">
                  {tela.caixaEditando ? (
                    <Botao
                      label="Excluir"
                      onPress={tela.solicitarExclusao}
                      variant="danger"
                      style={{ flex: 1 }}
                    />
                  ) : null}
                  <Botao
                    label="Cancelar"
                    onPress={tela.fecharModal}
                    variant="secondary"
                    style={{ flex: 1 }}
                  />
                  <Botao
                    label={tela.salvando ? "Salvando..." : "Salvar"}
                    onPress={tela.salvar}
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

      <ModalConfirmacao
        visivel={tela.confirmarExclusao}
        titulo="Excluir caixa"
        mensagem="Esta ação não pode ser desfeita. A caixa será removida se não tiver lançamentos."
        onConfirm={tela.confirmarExcluir}
        onCancelar={tela.cancelarExclusao}
      />
    </>
  );
}
