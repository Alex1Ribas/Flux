import { Alert, KeyboardAvoidingView, Platform, ScrollView, View, Text } from "react-native";
import {
  Botao,
  Campo,
  Cartao,
  SeletorChip,
  CabecalhoTela,
  SeletorCaixa,
} from "@/shared/components";
import { COLORS } from "@/shared/tokensDesign";
import { useTelaParcelamento } from "@/entities/parcelamento";
import { formatBRL } from "@/utils/helpers";
import type { TelaProps } from "@/types/navigation";

export function TelaParcelamento({ setTela, voltarPara = "previsao" }: TelaProps) {
  const tela = useTelaParcelamento();

  const salvar = async () => {
    const mensagem = await tela.salvar();
    if (!mensagem) return;

    Alert.alert("Parcelamento criado!", mensagem, [
      { text: "OK", onPress: () => setTela(voltarPara) },
    ]);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerClassName="p-4">
        <CabecalhoTela
          title="Parcelamento"
          setTela={setTela}
          backTo={voltarPara}
        />

        <SeletorChip
          opcoes={tela.tiposSaida}
          selecionado={tela.tipo}
          onSelect={tela.setTipo}
          label="Tipo"
        />
        {tela.erro.tipo && (
          <Text className="text-error text-[11px] -mt-2 mb-2.5">{tela.erro.tipo}</Text>
        )}

        <Campo
          label="Descrição detalhada"
          value={tela.descricao}
          onChangeText={tela.setDescricao}
          placeholder="Ex.: Notebook Dell XPS"
        />
        <Campo
          label="Valor total (R$)"
          value={tela.valorTotal}
          onChangeText={tela.setValorTotal}
          keyboardType="numeric"
          error={tela.erro.valor}
        />
        <Campo
          label="Número de parcelas"
          value={tela.parcelas}
          onChangeText={tela.setParcelas}
          keyboardType="numeric"
          error={tela.erro.parcelas}
        />
        <Campo
          label="Primeira competência (AAAA-MM)"
          value={tela.primeiraCompetencia}
          onChangeText={tela.setPrimeiraCompetencia}
        />

        {tela.preview && (
          <Cartao
            className="mb-3.5"
            style={{ backgroundColor: COLORS.surface2, borderColor: COLORS.border }}
          >
            <Text className="text-textMuted text-[13px] font-medium">
              {tela.preview.parcelas}× de {formatBRL(tela.preview.valorParcela)}
            </Text>
            <Text className="text-textMuted text-[11px] mt-0.5">
              A partir de {tela.preview.primeiraCompetenciaLabel} até{" "}
              {tela.preview.ultimaCompetenciaLabel}
            </Text>
          </Cartao>
        )}

        <SeletorCaixa
          caixasCatalogo={tela.caixasCatalogo}
          selecionado={tela.caixaOrigem}
          onSelect={tela.setCaixaOrigem}
          label="Caixa de origem"
        />
        {tela.erro.caixa && (
          <Text className="text-error text-[11px] -mt-2 mb-2.5">{tela.erro.caixa}</Text>
        )}
        {tela.erroGeral && <Text className="text-error text-[11px] mb-2.5">{tela.erroGeral}</Text>}

        <Botao
          label={tela.salvando ? "Salvando..." : "Criar Parcelamento"}
          onPress={salvar}
          size="lg"
          style={{ marginTop: 8 }}
          disabled={tela.salvando}
        />
        <View className="h-10" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
