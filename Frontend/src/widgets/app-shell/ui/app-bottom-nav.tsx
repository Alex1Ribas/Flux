import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabStore, type AppTab } from '@/features/navigation/model/tab-store';
import { cn } from '@/shared/lib/cn';

const BOTTOM_ITEMS: { tab: AppTab; label: string; icon: string }[] = [
  { tab: 'planejamento', label: 'Planejamento', icon: '▦' },
  { tab: 'simulador', label: 'Simulador', icon: '◎' },
];

export const AppBottomNav = () => {
  const insets = useSafeAreaInsets();
  const activeTab = useTabStore((state) => state.activeTab);
  const setActiveTab = useTabStore((state) => state.setActiveTab);

  return (
    <View
      className="absolute left-0 right-0 bottom-0 flex-row bg-surface-container-lowest border-t border-border-subtle px-2"
      style={{
        paddingTop: 11,
        paddingBottom: Math.max(insets.bottom, 8) + 5,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      {BOTTOM_ITEMS.map((item) => {
        const isActive = item.tab === activeTab;
        return (
          <Pressable
            key={item.tab}
            onPress={() => setActiveTab(item.tab)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            className={cn('flex-1 items-center py-2.5 rounded-control', isActive ? 'bg-brand-blue-soft' : '')}
          >
            <Text className={cn('text-badge-micro', isActive ? 'text-primary-container' : 'text-muted')}>
              {item.icon} {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
