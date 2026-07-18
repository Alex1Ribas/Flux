import { useState, type ReactNode } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { COLORS } from "@/shared/tokensDesign";
import { dataParaCompetencia, parseCompetencia } from "@/utils/helpers";

interface GatilhoPickerDataProps {
  /** ISO `YYYY-MM-DD` ou vazio. */
  value: string;
  onChange: (dataIso: string) => void;
  disabled?: boolean;
  tituloModal?: string;
  children: (abrir: () => void) => ReactNode;
}

/**
 * Encapsula o DateTimePicker nativo (Android dialog / iOS sheet).
 * O gatilho visual fica a cargo do consumidor.
 */
export function GatilhoPickerData({
  value,
  onChange,
  disabled = false,
  tituloModal = "Data",
  children,
}: GatilhoPickerDataProps) {
  const [aberto, setAberto] = useState(false);
  const valorData = value?.trim() ? parseCompetencia(value) : new Date();

  const abrir = () => {
    if (disabled) return;
    setAberto(true);
  };

  const aoMudar = (evento: DateTimePickerEvent, selecionada?: Date) => {
    if (Platform.OS === "android") {
      setAberto(false);
    }
    if (evento.type === "dismissed") return;
    if (!selecionada) return;
    onChange(dataParaCompetencia(selecionada));
  };

  return (
    <>
      {children(abrir)}

      {aberto && Platform.OS === "android" ? (
        <DateTimePicker
          value={valorData}
          mode="date"
          display="default"
          onChange={aoMudar}
        />
      ) : null}

      {Platform.OS === "ios" ? (
        <Modal
          visible={aberto}
          transparent
          animationType="slide"
          onRequestClose={() => setAberto(false)}
        >
          <Pressable
            className="flex-1 justify-end bg-black/70"
            onPress={() => setAberto(false)}
          >
            <Pressable
              onPress={(evento) => evento.stopPropagation()}
              className="bg-surface rounded-t-3xl border border-border pb-6"
            >
              <View className="flex-row justify-between items-center px-4 pt-4 pb-2">
                <Text className="text-textMuted text-md font-medium">{tituloModal}</Text>
                <Pressable
                  onPress={() => setAberto(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Confirmar data"
                >
                  <Text
                    className="text-xl font-semibold"
                    style={{ color: COLORS.primary }}
                  >
                    OK
                  </Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={valorData}
                mode="date"
                display="spinner"
                onChange={aoMudar}
                themeVariant="dark"
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </>
  );
}
