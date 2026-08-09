import { View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NAV_ICONS } from "@/shared/icons";
import { useCores } from "@/shared/tema";
import type { SetTela, TelaId } from "@/types/navigation";

const ICON_SIZE = 25;

const NAV_ITEMS: { id: keyof typeof NAV_ICONS; accessibilityLabel: string }[] = [
  { id: "inicio", accessibilityLabel: "Movimentar" },
  { id: "previsao", accessibilityLabel: "Acompanhamento" },
  { id: "contas", accessibilityLabel: "Contas" },
  { id: "caixas", accessibilityLabel: "Caixas" },
  { id: "painel", accessibilityLabel: "Painel" },
];

interface BarraNavegacaoProps {
  telaAtual: TelaId;
  setTela: SetTela;
}

export function BarraNavegacao({ telaAtual, setTela }: BarraNavegacaoProps) {
  const insets = useSafeAreaInsets();
  const cores = useCores();

  return (
    <View
      className="flex-row bg-surface border-t border-border pt-2.5"
      style={{ paddingBottom: insets.bottom + 10, backgroundColor: cores.surface }}
    >
      {NAV_ITEMS.map((item) => {
        const ativo = telaAtual === item.id;
        const Icon = NAV_ICONS[item.id];
        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => setTela(item.id)}
            accessibilityLabel={item.accessibilityLabel}
            accessibilityRole="button"
            accessibilityState={{ selected: ativo }}
            className="flex-1 items-center py-2"
          >
            <Icon
              size={ICON_SIZE}
              color={ativo ? cores.text : cores.textFaint}
              strokeWidth={ativo ? 2.75 : 2.5}
              fill={ativo ? cores.text : "none"}
            />
            {ativo ? (
              <View
                className="w-5 h-0.5 rounded-full mt-1.5"
                style={{ backgroundColor: cores.primary }}
              />
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
