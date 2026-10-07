import { useTabStore } from '@/features/navigation/model/tab-store';
import { ContasPage } from '@/pages/contas/ui/contas-page';
import { DashboardPage } from '@/pages/dashboard/ui/dashboard-page';
import { PlanejamentoPage } from '@/pages/planejamento/ui/planejamento-page';
import { SimuladorPage } from '@/pages/simulador/ui/simulador-page';
import { AppLayout } from '@/widgets/app-shell/ui/app-layout';

const ActivePage = () => {
  const activeTab = useTabStore((state) => state.activeTab);

  if (activeTab === 'dashboard') {
    return <DashboardPage />;
  }
  if (activeTab === 'contas') {
    return <ContasPage />;
  }
  if (activeTab === 'simulador') {
    return <SimuladorPage />;
  }
  return <PlanejamentoPage />;
};

export const TabRouter = () => (
  <AppLayout>
    <ActivePage />
  </AppLayout>
);
