import { Pressable, Text, View } from "react-native";
import { MotiView } from "moti";

import { feedbackTactilLeve } from "@/shared/feedbackTactil";
import { useCores } from "@/shared/tema";
import { BORDER_FINE } from "@/shared/tokensDesign";

interface ControleSegmentadoProps {
  opcoes: [string, string];
  selecionado: string;
  onSelect: (opcao: string) => void;
  largura?: number;
  compacto?: boolean;
}

/**
 * Toggle animado Entrada/Saída — pílula com spring (Moti).
 * Emerald = Entrada · Rose = Saída.
 */
export function ControleSegmentado({
  opcoes,
  selecionado,
  onSelect,
  largura = 220,
  compacto = false,
}: ControleSegmentadoProps) {
  const cores = useCores();
  const altura = compacto ? 50 : 54;
  const alturaThumb = compacto ? 44 : 48;
  const indice = selecionado === opcoes[1] ? 1 : 0;
  const ehEntrada = selecionado === "Entrada" || (selecionado === opcoes[0] && opcoes[0] === "Entrada");
  const corPills = ehEntrada ? cores.success : cores.error;
  const padding = 3;
  const larguraThumb = largura / 2 - padding * 2;

  return (
    <View
      className="items-center"
      style={{ marginVertical: compacto ? 0 : 16 }}
    >
      <View
        style={{
          width: largura,
          height: altura,
          borderRadius: altura / 2,
          backgroundColor: cores.surface2,
          borderWidth: BORDER_FINE,
          borderColor: cores.border,
          overflow: "hidden",
        }}
      >
        <MotiView
          animate={{
            translateX: indice * (largura / 2),
            backgroundColor: corPills,
          }}
          transition={{
            type: "spring",
            damping: 16,
            stiffness: 220,
            mass: 0.75,
          }}
          style={{
            position: "absolute",
            top: (altura - alturaThumb) / 2,
            left: padding,
            width: larguraThumb,
            height: alturaThumb,
            borderRadius: alturaThumb / 2,
          }}
        />
        <View className="flex-row flex-1">
          {opcoes.map((opcao) => {
            const ativo = opcao === selecionado;
            return (
              <Pressable
                key={opcao}
                onPress={() => {
                  void feedbackTactilLeve();
                  onSelect(opcao);
                }}
                className="items-center justify-center"
                style={{ width: largura / 2 }}
                accessibilityRole="button"
                accessibilityState={{ selected: ativo }}
              >
                <Text
                  className="text-xl font-semibold"
                  style={{ color: ativo ? cores.bg : cores.textMuted }}
                >
                  {opcao}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
