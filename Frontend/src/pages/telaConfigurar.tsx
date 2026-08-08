import { type Dispatch, type SetStateAction } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View, Text, TextInput } from "react-native";
import { Botao, Divisor, CabecalhoTela, TituloSecao } from "@/shared/components";
import { useTelaConfigurarCaixas } from "@/entities/configuracao";
import { useCores } from "@/shared/tema";
import { getMesLabel } from "@/utils/helpers";
import { CaixaIcon, Check } from "@/shared/icons";
import type { TelaProps } from "@/types/navigation";

export function TelaConfigurar({ setTela, voltarPara = "caixas" }: TelaProps) {
  const {
    mes,
    caixasCatalogo,
    valoresCaixa,
    setValoresCaixa,
    valoresOrc,
    setValoresOrc,
    salvo,
    erro,
    salvar,
  } = useTelaConfigurarCaixas();
  const cores = useCores();

  const renderCaixaInput = (
    caixaId: string,
    nome: string,
    indice: number,
    valores: Record<string, string>,
    setValores: Dispatch<SetStateAction<Record<string, string>>>
  ) => {
    return (
      <View
        key={caixaId}
        className="flex-row items-center gap-2.5 mb-3"
      >
        <View className="rounded-lg p-2 bg-surface2 border border-border">
          <CaixaIcon
            id={caixaId}
            indice={indice}
            size={18}
            color={cores.textMuted}
          />
        </View>
        <Text className="text-textMuted text-xs flex-1">{nome}</Text>
        <TextInput
          value={valores[caixaId]}
          onChangeText={(valorTexto) =>
            setValores((valoresAnteriores) => ({ ...valoresAnteriores, [caixaId]: valorTexto }))
          }
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={cores.textMuted}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-text text-sm w-[120px] text-right"
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerClassName="p-4">
        <CabecalhoTela
          title="Configurar Caixas"
          setTela={setTela}
          backTo={voltarPara}
        />

        <TituloSecao title="Saldos atuais (R$)" />
        {caixasCatalogo.map((caixa, indice) =>
          renderCaixaInput(caixa.id, caixa.nome, indice, valoresCaixa, setValoresCaixa)
        )}

        <Divisor />
        <TituloSecao title={`Metas das caixas — ${getMesLabel(mes)}`} />
        <Text className="text-textMuted text-[11px] mb-3">
          Defina quanto cada reserva deve manter protegido no mês atual.
        </Text>

        {caixasCatalogo.map((caixa, indice) =>
          renderCaixaInput(caixa.id, caixa.nome, indice, valoresOrc, setValoresOrc)
        )}

        {erro ? <Text className="text-error text-xs text-center mt-2">{erro}</Text> : null}

        <Botao
          label={salvo ? "Salvo!" : "Salvar Configurações"}
          icon={salvo ? Check : undefined}
          onPress={salvar}
          size="lg"
          variant={salvo ? "success" : "primary"}
          style={{ marginTop: 12 }}
        />
        <View className="h-10" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
