import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTabStore } from '@/features/navigation/model/tab-store';
import { SimulatorPanel } from '@/features/simulator/ui/simulator-panel';
import { AppBottomNav } from '@/widgets/app-shell/ui/app-bottom-nav';
import { AppHeader } from '@/widgets/app-shell/ui/app-header';
import { AppSidebar } from '@/widgets/app-shell/ui/app-sidebar';
import { PlanningBoard } from '@/widgets/planning-board/ui/planning-board';

export const HomePage = () => {
  const activeTab = useTabStore((state) => state.activeTab);

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['left', 'right']}>
      <AppHeader />
      <AppSidebar />
      <ScrollView
        className="flex-1"
        contentContainerClassName="w-full max-w-[1440px] self-center px-margin-mobile py-space-xl pb-28 gap-space-xl"
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === 'planejamento' ? <PlanningBoard /> : null}
        {activeTab === 'simulador' ? <SimulatorPanel /> : null}
      </ScrollView>
      <AppBottomNav />
    </SafeAreaView>
  );
};
