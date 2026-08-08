import { Pressable, Text, View, type ViewStyle } from "react-native";

import { Calendar } from "@/shared/icons";
import { COLORS } from "@/shared/tokensDesign";
import { formatarCompetencia } from "@/utils/helpers";

import { GatilhoPickerData } from "./gatilhoPickerData";

interface CampoDataProps {
  label?: string;
  /** Data ISO `YYYY-MM-DD`. String vazia = sem valor (mostra placeholder). */
  value: string;
  onChange: (dataIso: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  /** Só o ícone de calendário — para ficar ao lado de outro campo. */
  somenteIcone?: boolean;
}

/**
 * Campo de data no padrão visual de `Campo`.
 * Exibe a data formatada; ao tocar, abre o DateTimePicker nativo.
 */
export function CampoData({
  label,
  value,
  onChange,
  placeholder = "Selecionar data",
  error,
  disabled = false,
  style,
  accessibilityLabel,
  somenteIcone = false,
}: CampoDataProps) {
  const temValor = Boolean(value?.trim());
  const textoExibido = temValor ? formatarCompetencia(value) : placeholder;
  const corTexto = disabled
    ? COLORS.textMuted
    : temValor
      ? COLORS.text
      : COLORS.textMuted;
  const corIcone = disabled
    ? COLORS.textMuted
    : error
      ? COLORS.error
      : COLORS.primary;

  const rotuloAcessivel =
    accessibilityLabel ?? (temValor ? `Data: ${textoExibido}` : placeholder);

  return (
    <View
      className={somenteIcone ? undefined : "mb-3.5"}
      style={style}
    >
      {!somenteIcone && label ? (
        <Text className="text-textMuted text-2xl mb-1 font-medium">{label}</Text>
      ) : null}

      <GatilhoPickerData
        value={value}
        onChange={onChange}
        disabled={disabled}
        tituloModal={label ?? "Data"}
      >
        {(abrir) =>
          somenteIcone ? (
            <Pressable
              onPress={abrir}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityState={{ disabled }}
              accessibilityLabel={rotuloAcessivel}
              className={`items-center justify-center rounded-2xl border bg-surface ${
                error ? "border-error/60" : "border-border"
              } ${disabled ? "opacity-50" : ""}`}
              style={{ width: 48, height: 48 }}
              hitSlop={4}
            >
              <Calendar
                size={22}
                color={corIcone}
                strokeWidth={2}
              />
            </Pressable>
          ) : (
            <Pressable
              onPress={abrir}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityState={{ disabled }}
              accessibilityLabel={rotuloAcessivel}
              className={`flex-row items-center rounded-2xl border px-3 py-2.5 bg-surface ${
                error ? "border-error/60" : "border-border"
              } ${disabled ? "opacity-50" : ""}`}
              style={{ minHeight: 48 }}
            >
              <Text
                className="flex-1 text-1xl"
                style={{ color: corTexto }}
                numberOfLines={1}
              >
                {textoExibido}
              </Text>
              <Calendar
                size={20}
                color={corIcone}
                strokeWidth={2}
              />
            </Pressable>
          )
        }
      </GatilhoPickerData>

      {error ? <Text className="text-error text-[11px] mt-0.5">{error}</Text> : null}
    </View>
  );
}
