import { SafeAreaView } from "react-native-safe-area-context";

import { CarrosselBoasVindas } from "@/components/boasVindas/carrosselBoasVindas";
import type { SetTela } from "@/types/navigation";

interface TelaBoasVindasProps {
  setTela: SetTela;
  onConcluir: () => void;
}

export function TelaBoasVindas({ setTela, onConcluir }: TelaBoasVindasProps) {
  return (
    <SafeAreaView
      className="flex-1 bg-bg"
      edges={["top", "bottom"]}
    >
      <CarrosselBoasVindas
        onConcluir={onConcluir}
        onConfigurar={() => {
          onConcluir();
          setTela("recorrentes", { voltarPara: "inicio" });
        }}
      />
    </SafeAreaView>
  );
}
