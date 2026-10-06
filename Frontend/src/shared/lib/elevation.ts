import type { ViewStyle } from 'react-native';

/** Elevação Tier 1 do Stitch: card branco sobre canvas #f4f7fb */
export const cardShadowStyle: ViewStyle = {
  shadowColor: '#0f172a',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.06,
  shadowRadius: 15,
  elevation: 3,
};

export const primaryButtonShadowStyle: ViewStyle = {
  shadowColor: '#2563eb',
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 3,
};
