import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabStore, type AppTab } from '@/features/navigation/model/tab-store';

const TITLES: Record<AppTab, string> = {
  planejamento: 'Planejamento',
  simulador: 'Simulador',
};

const SUBTITLES: Record<AppTab, string> = {
  planejamento: 'Renda, contas e reserva mês a mês.',
  simulador: 'Confira se uma compra cabe no mês.',
};

export const AppHeader = () => {
  const insets = useSafeAreaInsets();
  const activeTab = useTabStore((state) => state.activeTab);
  const setSidebarOpen = useTabStore((state) => state.setSidebarOpen);

  return (
    <View
      className="px-4 pb-space-md flex-row items-center gap-3 border-b border-border-subtle bg-surface-container-lowest"
      style={{ paddingTop: insets.top + 10 }}
    >
      <Pressable
        onPress={() => setSidebarOpen(true)}
        className="w-9 h-9 rounded-control bg-primary-container items-center justify-center"
        accessibilityLabel="Abrir menu"
      >
        <Text className="text-on-primary font-bold text-title-sm">☰</Text>
      </Pressable>
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-2 flex-wrap">
          <Text className="text-title-md text-text-primary font-bold">
            Flux
          </Text>
          <View className="px-2 py-0.5 rounded-full bg-positive-soft flex-row items-center gap-1">
            <View className="w-1.5 h-1.5 rounded-full bg-positive-green" />
            <Text className="text-label-caps text-positive-green uppercase">
              Mês em curso
            </Text>
          </View>
        </View>
        <Text className="text-label-caps text-muted uppercase">
          {TITLES[activeTab]} · {SUBTITLES[activeTab]}
        </Text>
      </View>
    </View>
  );
};
