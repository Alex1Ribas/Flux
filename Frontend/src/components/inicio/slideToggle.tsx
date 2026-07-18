import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useCores } from "@/shared/tema";

import { useTokensInicio } from "./tokensInicio";

const LARGURA = 64;
const ALTURA = 36;
const KNOB = 30;
const PADDING = 3;
const DESLOCAMENTO = LARGURA - KNOB - PADDING * 2;

interface SlideToggleProps {
  ativo: boolean;
  onToggle: () => void;
  label?: string;
  accessibilityLabel?: string;
}

/**
 * Toggle deslizante — knob animado + track primary quando ativo.
 */
export function SlideToggle({
  ativo,
  onToggle,
  label = "Recorrência",
  accessibilityLabel,
}: SlideToggleProps) {
  const cores = useCores();
  const inicio = useTokensInicio();
  const progresso = useSharedValue(ativo ? 1 : 0);

  useEffect(() => {
    progresso.value = withSpring(ativo ? 1 : 0, {
      damping: 16,
      stiffness: 220,
      mass: 0.7,
    });
  }, [ativo, progresso]);

  const estiloTrack = useAnimatedStyle(
    () => ({
      backgroundColor: interpolateColor(
        progresso.value,
        [0, 1],
        [inicio.surface, cores.primary]
      ),
      borderColor: interpolateColor(
        progresso.value,
        [0, 1],
        [inicio.border, cores.primary]
      ),
    }),
    [inicio.surface, inicio.border, cores.primary]
  );

  const estiloKnob = useAnimatedStyle(
    () => ({
      transform: [{ translateX: progresso.value * DESLOCAMENTO }],
      backgroundColor: interpolateColor(
        progresso.value,
        [0, 1],
        [inicio.textMuted, inicio.bg]
      ),
    }),
    [inicio.textMuted, inicio.bg]
  );

  return (
    <View className="flex-row items-center gap-2">
      {label ? (
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: ativo ? cores.primary : inicio.textMuted,
          }}
        >
          {label}
        </Text>
      ) : null}
      <Pressable
        onPress={onToggle}
        accessibilityRole="switch"
        accessibilityState={{ checked: ativo }}
        accessibilityLabel={accessibilityLabel ?? `${label} ${ativo ? "On" : "Off"}`}
        hitSlop={8}
      >
        <Animated.View
          style={[
            {
              width: LARGURA,
              height: ALTURA,
              borderRadius: ALTURA / 2,
              borderWidth: 0.5,
              justifyContent: "center",
              paddingHorizontal: PADDING,
            },
            estiloTrack,
          ]}
        >
          <Text
            style={{
              position: "absolute",
              opacity: 0,
              width: 1,
              height: 1,
            }}
            accessibilityElementsHidden
            importantForAccessibility="no"
          >
            {ativo ? "On" : "Off"}
          </Text>
          <Animated.View
            style={[
              {
                width: KNOB,
                height: KNOB,
                borderRadius: KNOB / 2,
                shadowColor: "#000",
                shadowOpacity: 0.25,
                shadowRadius: 3,
                shadowOffset: { width: 0, height: 1 },
                elevation: 2,
              },
              estiloKnob,
            ]}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}
