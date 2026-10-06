import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { primaryButtonShadowStyle } from '@/shared/lib/elevation';
import { SurfaceCard } from '@/shared/ui/surface-card';

interface IAuthLayoutProps {
  title: string;
  subtitle: string;
  submitLabel: string;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: () => void;
  switchPrompt: string;
  switchLabel: string;
  onSwitch: () => void;
  children: ReactNode;
}

export const AuthLayout = ({
  title,
  subtitle,
  submitLabel,
  isSubmitting,
  error,
  onSubmit,
  switchPrompt,
  switchLabel,
  onSwitch,
  children,
}: IAuthLayoutProps) => (
  <SafeAreaView className="flex-1 bg-app-bg">
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-margin-mobile py-space-xl"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-[420px] self-center gap-space-xl">
          <View className="items-center gap-2">
            <View className="w-12 h-12 rounded-md bg-primary-container items-center justify-center">
              <Text className="text-on-primary font-black text-headline-sm">$</Text>
            </View>
            <Text className="text-headline-md text-text-primary">Flux</Text>
          </View>

          <SurfaceCard className="gap-4">
            <View className="gap-1">
              <Text className="text-headline-sm text-text-primary font-bold" accessibilityRole="header">
                {title}
              </Text>
              <Text className="text-body-md text-muted">{subtitle}</Text>
            </View>

            {children}

            {error ? (
              <View className="p-3 rounded-control bg-danger-soft border border-danger-border">
                <Text className="text-danger-text text-body-sm">{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={onSubmit}
              disabled={isSubmitting}
              className="h-[46px] rounded-control bg-primary-container items-center justify-center"
              style={primaryButtonShadowStyle}
              accessibilityRole="button"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-title-sm text-on-primary font-bold">{submitLabel}</Text>
              )}
            </Pressable>
          </SurfaceCard>

          <View className="flex-row items-center justify-center gap-1.5 flex-wrap">
            <Text className="text-body-md text-muted">{switchPrompt}</Text>
            <Pressable onPress={onSwitch} accessibilityRole="link" hitSlop={8}>
              <Text className="text-title-sm text-primary-container">{switchLabel}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
);
