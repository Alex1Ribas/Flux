import { ActivityIndicator, Text, View } from "react-native";

import { useCores } from "@/shared/tema";

export function TelaAtualizacao() {
  const cores = useCores();

  return (
    <View className="flex-1 bg-bg items-center justify-center gap-4 px-6">
      <ActivityIndicator
        size="large"
        color={cores.textMuted}
      />
      <Text className="text-text text-base text-center">
        Baixando atualizações
      </Text>
    </View>
  );
}
