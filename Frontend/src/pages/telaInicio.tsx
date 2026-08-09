import { useEffect, useState } from "react";
import { Keyboard, Pressable, ScrollView, Text, View } from "react-native";

import {
  AutocompleteCategoria,
  CabecalhoCaixas,
  ControleSegmentado,
  SlideToggle,
  useTokensInicio,
  ValorPrincipal,
} from "@/components/inicio";
import { ItemLancamento } from "@/components/flux/itemLancamento";
import { Botao, CampoData, SeletorCaixa } from "@/shared/components";
import { useTelaInicio } from "@/entities/inicio";
import { useAuth } from "@/entities/auth";
import { useFundoTela, useEstiloSuperficie } from "@/shared/estiloSuperficie";
import { useTema } from "@/shared/tema";
import { MARCA } from "@/shared/tokensDesign";
import type { TelaProps } from "@/types/navigation";
import { formatBRL } from "@/utils/helpers";
import { AlertTriangle, ChevronDown, ChevronUp, Moon, Sun, Wallet } from "@/shared/icons";
import { ArrowRightIcon } from "lucide-react-native";

export function TelaInicio({
  setTela,
  modoInicial = "entrada",
  horizonteInicial = "presente",
  caixaInicial,
}: TelaProps) {
  const { logout, sessao } = useAuth();
  const home = useTelaInicio({ modoInicial, horizonteInicial, caixaInicial });
  const fundo = useFundoTela();
  const { isDark, alternar, cores } = useTema();
  const tokens = useTokensInicio();
  const superficie = useEstiloSuperficie();
  const [historicoAberto, setHistoricoAberto] = useState(false);

  useEffect(() => {
    Keyboard.dismiss();
  }, []);

  return (
    <View
      className="flex-1 bg-bg"
      style={{ backgroundColor: fundo }}
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="pb-4"
      >
        {/* Header compacto */}
        <View className="px-4 pt-6 pb-4 flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text
              className="text-sm font-semibold uppercase tracking-wide text-primary"
              style={{ color: cores.primary }}
            >
              {MARCA}
            </Text>
            <Text
              className="text-text text-2xl font-semibold"
              numberOfLines={1}
            >
              {sessao?.usuario?.name ? `Olá, ${sessao.usuario.name}` : "Olá"}
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={alternar}
              accessibilityRole="button"
              accessibilityLabel={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
              className="p-2 rounded-2xl border border-border bg-surface"
              hitSlop={8}
            >
              {isDark ? (
                <Sun
                  size={18}
                  color={cores.primary}
                  strokeWidth={2}
                />
              ) : (
                <Moon
                  size={18}
                  color={cores.primary}
                  strokeWidth={2}
                />
              )}
            </Pressable>
            <Pressable
              className="flex-row items-center gap-1.5 py-1"
              onPress={logout}
              accessibilityRole="button"
              accessibilityLabel="Sair"
            >
              <Text className="text-textMuted text-md font-medium">Sair</Text>
              <ArrowRightIcon
                size={18}
                color={cores.textMuted}
              />
            </Pressable>
          </View>
        </View>

        {/* 1. Natureza — define a pergunta da caixa */}
        <View className="px-4 mb-5">
          <View className="flex-row justify-center items-center">
            <ControleSegmentado
              opcoes={["Entrada", "Saída"]}
              selecionado={home.modoLabel}
              onSelect={(opcao) => home.setModo(opcao === "Entrada" ? "entrada" : "saida")}
              largura={220}
              compacto
            />
          </View>
        </View>

        {/* 2. Origem/Destino — caixas */}
        <View className="mb-5">
          <CabecalhoCaixas
            caixasCatalogo={home.caixasCatalogo}
            caixas={home.caixas}
            selecionada={home.caixaSelecionada}
            onSelect={home.setCaixaSelecionada}
            pergunta={
              home.modo === "entrada" ? "Para onde vai o dinheiro?" : "De onde sai o dinheiro?"
            }
            nomeSelecionada={home.nomeCaixaSelecionada}
          />
        </View>

        {/* 3. Valor */}
        <View className="mb-2">
          <ValorPrincipal
            valor={home.valor}
            onChangeValor={home.setValor}
            modo={home.modo}
          />
        </View>

        {/* 4. Motivo do lançamento + data + recorrência */}
        <View
          className="mx-4 mb-5 rounded-3xl border p-4"
          style={superficie}
        >
          <View
            className="flex-row items-end gap-2"
            style={{ marginBottom: 14 }}
          >
            <View className="flex-1">
              <AutocompleteCategoria
                token={home.token}
                modo={home.modo}
                valor={home.tipo}
                onChange={home.selecionarMotivo}
              />
            </View>
            <CampoData
              value={home.dataLancamento}
              onChange={home.setDataLancamento}
              somenteIcone
              accessibilityLabel="Selecionar data"
            />
          </View>

          <View
            className="mt-4 pt-4 flex-row items-center justify-between gap-3"
            style={{ borderTopWidth: 0.5, borderTopColor: tokens.border }}
          >
            <Text
              className="font-semibold"
              style={{
                fontSize: 15,
                color: home.recorrente ? cores.primary : tokens.textMuted,
              }}
            >
              Recorrente
            </Text>
            <Text
              className="flex-1 text-textFaint text-xs leading-4"
              numberOfLines={2}
            >
              {home.recorrente
                ? "Compromisso fixo no planejamento do mês."
                : "Movimentação do dia a dia, fora do planejado."}
            </Text>
            <SlideToggle
              ativo={home.recorrente}
              onToggle={() => home.setRecorrente(!home.recorrente)}
              accessibilityLabel="Marcar lançamento como recorrente"
            />
          </View>
        </View>

        {home.precisaCompensacao ? (
          <View
            className="mx-4 mb-4 p-4 rounded-3xl border border-error/40 bg-error-highlight"
            style={{
              backgroundColor: cores.errorHighlight,
              borderWidth: 0.5,
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
                className="text-md font-semibold text-error"
                style={{ color: cores.error }}
              >
                Estouro: {formatBRL(home.estouro)}
              </Text>
            </View>
            <SeletorCaixa
              caixasCatalogo={home.caixasCatalogo}
              selecionado={home.caixaCompensacao}
              onSelect={home.setCaixaCompensacao}
              excluir={home.caixaSelecionada}
            />
          </View>
        ) : null}

        {home.erro ? (
          <Text className="text-error text-md text-center mb-3 px-4">{home.erro}</Text>
        ) : null}

        {/* 5. Ação */}
        <View className="mx-4 mb-6 rounded-3xl border border-border bg-surface p-4">
          <Botao
            label="Registrar"
            onPress={home.registrar}
            size="lg"
            variant="success"
            style={{ width: "100%" }}
          />
        </View>
      </ScrollView>

      {/* 6. Histórico compacto — retrátil */}
      <View
        className="px-4 pt-3 pb-3"
        style={{
          borderTopWidth: 0.5,
          borderTopColor: tokens.border,
          backgroundColor: fundo,
        }}
      >
        <View className="flex-row justify-between items-center">
          <Pressable
            onPress={() => setHistoricoAberto((aberto) => !aberto)}
            accessibilityRole="button"
            accessibilityState={{ expanded: historicoAberto }}
            accessibilityLabel={
              historicoAberto ? "Recolher últimos lançamentos" : "Expandir últimos lançamentos"
            }
            className="flex-row items-center gap-1.5 flex-1 mr-3"
            hitSlop={8}
          >
            <Text className="text-textMuted text-md font-semibold">Últimos lançamentos</Text>
            {historicoAberto ? (
              <ChevronUp
                size={16}
                color={tokens.textMuted}
                strokeWidth={2}
              />
            ) : (
              <ChevronDown
                size={16}
                color={tokens.textMuted}
                strokeWidth={2}
              />
            )}
          </Pressable>
          <Pressable onPress={() => setTela("painel")}>
            <Text className="text-text text-sm font-medium">Ver painel</Text>
          </Pressable>
        </View>

        {historicoAberto ? (
          <View className="mt-2">
            {home.ultimosLancamentos.length === 0 ? (
              <View className="items-center justify-center py-3 gap-1">
                <Wallet
                  size={22}
                  color={tokens.textMuted}
                  strokeWidth={1.75}
                />
                <Text className="text-textMuted text-sm text-center">
                  Nenhum lançamento neste mês
                </Text>
              </View>
            ) : (
              home.ultimosLancamentos.slice(0, 2).map((lancamento) => (
                <ItemLancamento
                  key={lancamento.id}
                  caixasCatalogo={home.caixasCatalogo}
                  lancamento={lancamento}
                  somenteLeitura
                />
              ))
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
}
