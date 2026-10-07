import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { userQueries } from '@/entities/user/api/user-queries';
import { SignOutButton } from '@/features/auth/ui/sign-out-button';
import { useTabStore, type AppTab } from '@/features/navigation/model/tab-store';
import { cn } from '@/shared/lib/cn';

const NAV_ITEMS: { tab: AppTab; label: string; icon: string }[] = [
  { tab: 'dashboard', label: 'Dashboard', icon: '◫' },
  { tab: 'planejamento', label: 'Planejamento', icon: '▦' },
  { tab: 'contas', label: 'Contas', icon: '≡' },
  { tab: 'simulador', label: 'Simulador', icon: '◎' },
];

const initials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

export const AppSidebar = () => {
  const insets = useSafeAreaInsets();
  const activeTab = useTabStore((state) => state.activeTab);
  const sidebarOpen = useTabStore((state) => state.sidebarOpen);
  const setActiveTab = useTabStore((state) => state.setActiveTab);
  const setSidebarOpen = useTabStore((state) => state.setSidebarOpen);
  const userQuery = useQuery(userQueries.me());
  const userName = userQuery.data?.name ?? 'Titular';

  return (
    <Modal
      visible={sidebarOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setSidebarOpen(false)}
    >
      <View className="flex-1 flex-row">
        <View
          className="w-60 h-full bg-dark-sidebar border-r border-dark-sidebar-border justify-between"
          style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16, paddingHorizontal: 16 }}
        >
          <View className="gap-6">
            <View className="flex-row items-center gap-3 px-1">
              <View className="w-9 h-9 rounded-md bg-primary-container items-center justify-center">
                <Text className="text-on-primary font-black text-lg">$</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-headline-sm leading-none">
                  Flux
                </Text>
                <View className="flex-row items-center gap-1.5 mt-1">
                  <View className="w-1.5 h-1.5 rounded-full bg-positive-green" />
                  <Text className="text-label-caps text-dark-sidebar-muted uppercase">
                    Planejamento mensal
                  </Text>
                </View>
              </View>
            </View>

            <View className="gap-1.5">
              {NAV_ITEMS.map((item) => {
                const isActive = item.tab === activeTab;
                return (
                  <Pressable
                    key={item.tab}
                    onPress={() => {
                      setActiveTab(item.tab);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      'min-h-[44px] px-space-md py-space-sm rounded-control flex-row items-center gap-space-sm',
                      isActive ? 'bg-dark-sidebar-active' : '',
                    )}
                  >
                    <Text
                      className={cn(
                        'text-title-sm',
                        isActive ? 'text-white' : 'text-dark-sidebar-muted',
                      )}
                    >
                      {item.icon}
                    </Text>
                    <Text
                      className={cn(
                        isActive
                          ? 'text-title-sm text-white font-bold'
                          : 'text-body-md text-dark-sidebar-muted',
                      )}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="gap-2 pt-4 border-t border-dark-sidebar-border">
            <SignOutButton />
            <View className="flex-row items-center gap-3 p-2 rounded-control bg-dark-sidebar-hover border border-dark-sidebar-border">
              <View className="w-8 h-8 rounded-full bg-dark-sidebar-active items-center justify-center">
                <Text className="text-white font-bold text-xs">{initials(userName)}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-title-sm text-white" numberOfLines={1}>{userName}</Text>
                <Text className="text-badge-micro text-dark-sidebar-muted" numberOfLines={1}>
                  {userQuery.data?.email ?? ''}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <Pressable
          className="flex-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.52)' }}
          onPress={() => setSidebarOpen(false)}
        />
      </View>
    </Modal>
  );
};
