import { useEffect } from "react";
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
import { useFundoTela } from "@/shared/estiloSuperficie";
import { useTema } from "@/shared/tema";
import { MARCA } from "@/shared/tokensDesign";
import type { TelaProps } from "@/types/navigation";
import { formatBRL } from "@/utils/helpers";
import { AlertTriangle, Moon, Sun, Wallet } from "@/shared/icons";
import { ArrowRightIcon } from "lucide-react-native";

export function TelaInicio({
  setTela,
  modoInicial = "entrada",
  horizonteInicial = "presente",
  caixaInicial = "saldo_atual",
}: TelaProps) {
  const { logout, sessao } = useAuth();
  const home = useTelaInicio({ modoInicial, horizonteInicial, caixaInicial });
  const fundo = useFundoTela();
  const { isDark, alternar, cores } = useTema();
  const tokens = useTokensInicio();

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

        {/* 1. Origem/Destino — caixas */}
        <View className="mb-5">
          <CabecalhoCaixas
            caixasCatalogo={home.caixasCatalogo}
            caixas={home.caixas}
            selecionada={home.caixaSelecionada}
            onSelect={home.setCaixaSelecionada}
          />
        </View>

        {/* 2. Valor */}
        <View className="mb-2">
          <ValorPrincipal
            valor={home.valor}
            onChangeValor={home.setValor}
            modo={home.modo}
          />
        </View>

        {/* 3. Natureza */}
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

        {/* 4. Classificação — data + categoria + recorrência */}
        <View className="mx-4 mb-5 rounded-3xl border border-border bg-surface p-4 shadow-xl shadow-slate-200/50">
          <CampoData
            label="Data"
            value={home.dataLancamento}
            onChange={home.setDataLancamento}
            placeholder="Selecionar data"
            style={{ marginBottom: 14 }}
          />

          <AutocompleteCategoria
            token={home.token}
            modo={home.modo}
            valor={home.tipo}
            onChange={home.selecionarMotivo}
          />

          <View
            className="mt-4 pt-4"
            style={{ borderTopWidth: 0.5, borderTopColor: tokens.border }}
          >
            <SlideToggle
              ativo={home.recorrente}
              onToggle={() => home.setRecorrente(!home.recorrente)}
              label={home.recorrente ? "Recorrente" : "Avulso"}
              accessibilityLabel="Marcar lançamento como recorrente ou avulso"
            />
            <Text className="text-textFaint text-xs mt-2 leading-4">
              {home.recorrente
                ? "Compromisso fixo no planejamento do mês."
                : "Movimentação do dia a dia, fora do planejado."}
            </Text>
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
        <View className="mx-4 mb-6">
          <Botao
            label="Registrar"
            onPress={home.registrar}
            size="lg"
          />
        </View>
      </ScrollView>

      {/* 6. Histórico compacto — 2 últimos */}
      <View
        className="px-4 pt-3 pb-3"
        style={{
          borderTopWidth: 0.5,
          borderTopColor: tokens.border,
          backgroundColor: fundo,
        }}
      >
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-textMuted text-md font-semibold">Últimos lançamentos</Text>
          <Pressable onPress={() => setTela("painel")}>
            <Text className="text-text text-sm font-medium">Ver painel</Text>
          </Pressable>
        </View>

        {home.ultimosLancamentos.length === 0 ? (
          <View className="items-center justify-center py-3 gap-1">
            <Wallet
              size={22}
              color={tokens.textMuted}
              strokeWidth={1.75}
            />
            <Text className="text-textMuted text-sm text-center">Nenhum lançamento neste mês</Text>
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
    </View>
  );
}
