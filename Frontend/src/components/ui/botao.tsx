import { Pressable, Text, View, type ViewStyle } from "react-native";
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

  let iconColor = cores.text;
  if (disabled) {
    iconColor = cores.textMuted;
  } else if (variant === "ghost") {
    iconColor = cores.textMuted;
  } else if (variant === "danger") {
    iconColor = cores.error;
  } else if (variant === "success") {
    iconColor = cores.success;
  } else if (variant === "primary") {
    iconColor = cores.white;
  }

  const corTexto = disabled ? cores.textMuted : variantText[variant];

  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        void feedbackTactilLeve();
        onPress();
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
      style={({ pressed }) => {
        const scale = pressed && !disabled ? 0.95 : 1;

        return [
          {
            borderRadius: 20,
            backgroundColor: disabled ? cores.surface : variantBg[variant],
            borderWidth: variant === "ghost" ? 0 : 1,
            borderColor: disabled ? cores.border : variantBorder[variant],
            opacity: disabled ? 0.5 : 1,
            transform: [{ scale }],
            ...SIZE_PAD[size],
          },
          style,
        ];
      }}
    >
      {/* View interna: evita texto sumir com flex:1 no pressable (bug do MotiPressable). */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
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
            color: corTexto,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
