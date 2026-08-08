import { View, Text, TextInput, type KeyboardTypeOptions } from "react-native";

import { useCores } from "@/shared/tema";

interface CampoProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  multiline?: boolean;
  error?: string;
}

export function Campo({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  secureTextEntry = false,
  multiline = false,
  error,
}: CampoProps) {
  const cores = useCores();

  return (
    <View className="mb-3.5">
      {label ? <Text className="text-textMuted text-2xl mb-1 font-medium">{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || ""}
        placeholderTextColor={cores.textMuted}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        className={`bg-surface border rounded-2xl px-3 py-2.5 text-text text-1xl ${error ? "border-error/60" : "border-border"} ${multiline ? "min-h-[72px]" : ""}`}
      />
      {error ? <Text className="text-error text-[11px] mt-0.5">{error}</Text> : null}
    </View>
  );
}
