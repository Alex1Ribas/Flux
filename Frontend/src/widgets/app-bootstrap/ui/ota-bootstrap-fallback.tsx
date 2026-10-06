import { ActivityIndicator, Text, View } from 'react-native';
import type { EstadoAtualizacaoOta } from '@/shared/lib/ota/use-atualizacao-ota';

export interface IOtaBootstrapFallbackProps {
  estado: EstadoAtualizacaoOta;
}

export const OtaBootstrapFallback = ({ estado }: IOtaBootstrapFallbackProps) => (
  <View className="flex-1 items-center justify-center bg-app-bg px-6 gap-3">
    <ActivityIndicator color="#2563eb" size="large" />
    <Text className="text-title-md text-text-primary font-bold">
      {estado === 'baixando' ? 'Atualizando…' : 'Verificando atualizações…'}
    </Text>
  </View>
);
