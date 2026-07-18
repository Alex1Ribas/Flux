import { useMemo } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { CartaoCaixa } from "@/components/flux/cartaoCaixa";
import { Botao, Campo, ModalConfirmacao, NumeroAnimado } from "@/shared/components";
import { useTelaCaixas } from "@/entities/caixas";
import { useFundoTela } from "@/shared/estiloSuperficie";
import { COLORS, MARCA } from "@/shared/tokensDesign";
import { Plus } from "@/shared/icons";
import { formatBRL, getDiasNoMes, somarCaixas } from "@/utils/helpers";
import type { TelaProps } from "@/types/navigation";

export function TelaCaixas(_props: TelaProps) {
  const tela = useTelaCaixas();
  const totalCaixas = somarCaixas(tela.caixas);
  const diasNoMes = getDiasNoMes(tela.competencia);
  const fundo = useFundoTela();

  const { orcamentos, objetivos } = useMemo(() => {
    const orcamentosLista = tela.caixasCatalogo.filter(
      (caixa) => (caixa.tipo ?? "orcamento") !== "objetivo"
    );
    const objetivosLista = tela.caixasCatalogo.filter(
      (caixa) => caixa.tipo === "objetivo"
    );
    return { orcamentos: orcamentosLista, objetivos: objetivosLista };
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
              style={{ color: COLORS.primary }}
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
            className="p-2.5 bg-surface rounded-2xl border border-border shadow-xl shadow-slate-200/50"
            accessibilityRole="button"
            accessibilityLabel="Nova caixa"
          >
            <Plus
              size={20}
              color={COLORS.text}
              strokeWidth={2}
            />
          </Pressable>
        </View>

        <Text className="text-textMuted text-xs font-semibold uppercase tracking-wide mb-3">
          Orçamentos
        </Text>
        {orcamentos.length === 0 ? (
          <Text className="text-textMuted text-sm mb-5">Nenhum orçamento cadastrado</Text>
        ) : (
          orcamentos.map((caixa) => {
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
                  diasNoMes={diasNoMes}
                />
              </Pressable>
            );
          })
        )}

        <View className="bg-surface rounded-3xl p-4 mt-2 border border-border flex-row justify-between items-center shadow-xl shadow-slate-200/50">
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
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-bg rounded-t-3xl border border-border px-4 pt-5 pb-8">
            <Text className="text-text text-2xl font-medium mb-1">
              {tela.caixaEditando ? "Editar caixa" : "Nova caixa"}
            </Text>
            <Text className="text-textMuted text-md mb-4">
              Escolha entre caixa de objetivo ou de orçamento
            </Text>

            <View className="flex-row gap-2 mb-4">
              {(
                [
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
                      borderColor: ativo ? COLORS.text : COLORS.border,
                      backgroundColor: ativo ? COLORS.surface2 : COLORS.surface,
                    }}
                  >
                    <Text
                      className="text-center text-md font-medium"
                      style={{ color: COLORS.text }}
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
                tela.formulario.tipo === "objetivo"
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

            {tela.formulario.tipo === "objetivo" ? (
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
                  onChangeText={(valor) => tela.atualizarCampo("orcamentoMensalTexto", valor)}
                  keyboardType="numeric"
                  placeholder="400"
                />
                {tela.limitesOrcamento && Number(tela.formulario.orcamentoMensalTexto) > 0 ? (
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
          </View>
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
