import type { ReactNode } from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from '@/shared/lib/cn';
import { cardShadowStyle } from '@/shared/lib/elevation';

interface IHeroCardProps {
  children: ReactNode;
  className?: string;
}

export const HeroCard = ({ children, className }: IHeroCardProps) => (
  <View className={cn('rounded-lg overflow-hidden', className)} style={cardShadowStyle}>
    <LinearGradient
      colors={['#1d4ed8', '#2563eb']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ padding: 20 }}
    >
      {children}
    </LinearGradient>
  </View>
);
