import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBottomNav } from './app-bottom-nav';
import { AppHeader } from './app-header';
import { AppSidebar } from './app-sidebar';

interface IAppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: IAppLayoutProps) => (
  <SafeAreaView className="flex-1 bg-app-bg" edges={['left', 'right']}>
    <AppHeader />
    <AppSidebar />
    <ScrollView
      className="flex-1"
      contentContainerClassName="w-full max-w-[1440px] self-center px-margin-mobile py-space-xl pb-28 gap-space-xl"
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
    <AppBottomNav />
  </SafeAreaView>
);
