import { Text, TextInput, View } from "react-native";

import { formatBRL } from "@/utils/helpers";

import { useTokensInicio } from "./tokensInicio";

interface ValorPrincipalProps {
  valor: string;
  onChangeValor: (texto: string) => void;
  modo: "entrada" | "saida";
}

export function ValorPrincipal({ valor, onChangeValor, modo }: ValorPrincipalProps) {
  const tokens = useTokensInicio();
  const valorNum = Number(valor) || 0;
  const prefixo = modo === "saida" && valorNum > 0 ? "−" : "";

  return (
    <View className="items-center justify-center px-4 py-6">
      <TextInput
        value={valor}
        onChangeText={(texto) => onChangeValor(texto.replace(/[^0-9.,]/g, "").replace(",", "."))}
        keyboardType="decimal-pad"
        placeholder="R$ 0,00"
        placeholderTextColor={tokens.textMuted}
        className="text-text text-8xl font-light text-center w-full"
        style={{ color: tokens.text }}
        accessibilityLabel="Valor do lançamento"
      />
      {valorNum > 0 ? (
        <Text
          className="text-md font-medium mt-2"
          style={{ color: tokens.textMuted }}
        >
          {prefixo}
          {formatBRL(valorNum)}
        </Text>
      ) : null}
    </View>
  );
}
