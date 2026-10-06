import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProviders } from './providers/app-providers';
import { SessionGate } from './providers/session-gate';
import { HomePage } from '@/pages/home/ui/home-page';
import { useAtualizacaoOta } from '@/shared/lib/ota/use-atualizacao-ota';
import { OtaBootstrapFallback } from '@/widgets/app-bootstrap/ui/ota-bootstrap-fallback';

const AppEntry = () => {
  const estadoAtualizacao = useAtualizacaoOta();

  if (estadoAtualizacao !== 'pronto') {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <OtaBootstrapFallback estado={estadoAtualizacao} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AppProviders>
        <StatusBar style="dark" />
        <SessionGate>
          <HomePage />
        </SessionGate>
      </AppProviders>
    </SafeAreaProvider>
  );
};

export default AppEntry;
