import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { cn } from '@/shared/lib/cn';
import { cardShadowStyle } from '@/shared/lib/elevation';

interface ISurfaceCardProps extends ViewProps {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

export const SurfaceCard = ({
  children,
  className,
  padded = true,
  style,
  ...props
}: ISurfaceCardProps) => (
  <View
    className={cn(
      'bg-card-bg border border-border-subtle rounded-lg overflow-hidden',
      padded ? 'p-5' : '',
      className,
    )}
    style={[cardShadowStyle, style]}
    {...props}
  >
    {children}
  </View>
);
