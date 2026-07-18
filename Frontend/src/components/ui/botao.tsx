import { useCallback } from "react";
import { Text, type ViewStyle } from "react-native";
import { MotiPressable } from "moti/interactions";
import type { LucideIcon } from "lucide-react-native";

import { feedbackTactilLeve } from "@/shared/feedbackTactil";
import { useCores } from "@/shared/tema";

type VarianteBotao = "primary" | "secondary" | "ghost" | "danger" | "success";
type BtnSize = "sm" | "md" | "lg";

const SIZE_PAD: Record<BtnSize, ViewStyle> = {
  sm: { paddingHorizontal: 12, paddingVertical: 6 },
  md: { paddingHorizontal: 16, paddingVertical: 10 },
  lg: { paddingHorizontal: 20, paddingVertical: 14 },
};

const SIZE_TEXT: Record<BtnSize, number> = {
  sm: 12,
  md: 14,
  lg: 15,
};

const ICON_SIZE: Record<BtnSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

interface PropriedadesBotao {
  label: string;
  onPress: () => void;
  variant?: VarianteBotao;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  style?: ViewStyle;
  icon?: LucideIcon;
}

export function Botao({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  style,
  icon: Icon,
}: PropriedadesBotao) {
  const cores = useCores();

  const variantBg: Record<VarianteBotao, string> = {
    primary: cores.primary,
    secondary: cores.surface,
    ghost: "transparent",
    danger: cores.errorHighlight,
    success: cores.successHighlight,
  };

  const variantBorder: Record<VarianteBotao, string> = {
    primary: cores.primary,
    secondary: cores.border,
    ghost: "transparent",
    danger: cores.border,
    success: cores.border,
  };

  const variantText: Record<VarianteBotao, string> = {
    primary: cores.white,
    secondary: cores.text,
    ghost: cores.textMuted,
    danger: cores.error,
    success: cores.success,
  };

  const iconColor = disabled
    ? cores.textMuted
    : variant === "ghost"
      ? cores.textMuted
      : variant === "danger"
        ? cores.error
        : variant === "success"
          ? cores.success
          : variant === "primary"
            ? cores.white
            : cores.text;

  const animatePress = useCallback(
    ({ pressed }: { pressed: boolean }) => {
      "worklet";
      return {
        scale: pressed && !disabled ? 0.95 : 1,
      };
    },
    [disabled]
  );

  return (
    <MotiPressable
      onPress={() => {
        if (disabled) return;
        void feedbackTactilLeve();
        onPress();
      }}
      disabled={disabled}
      animate={animatePress}
      transition={{ type: "timing", duration: 120 }}
      style={[
        {
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 6,
          backgroundColor: disabled ? cores.surface : variantBg[variant],
          borderWidth: variant === "ghost" ? 0 : 1,
          borderColor: disabled ? cores.border : variantBorder[variant],
          opacity: disabled ? 0.5 : 1,
          ...SIZE_PAD[size],
        },
        style,
      ]}
    >
      {Icon ? (
        <Icon
          size={ICON_SIZE[size]}
          color={iconColor}
          strokeWidth={2}
        />
      ) : null}
      <Text
        style={{
          fontWeight: "500",
          fontSize: SIZE_TEXT[size],
          color: disabled ? cores.textMuted : variantText[variant],
        }}
      >
        {label}
      </Text>
    </MotiPressable>
  );
}
