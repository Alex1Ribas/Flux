import { create } from 'zustand';

export type AppTab = 'planejamento' | 'simulador';

interface ITabStore {
  activeTab: AppTab;
  sidebarOpen: boolean;
  setActiveTab: (tab: AppTab) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useTabStore = create<ITabStore>((set) => ({
  activeTab: 'planejamento',
  sidebarOpen: false,
  setActiveTab: (tab) => set({ activeTab: tab, sidebarOpen: false }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
