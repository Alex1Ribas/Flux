import { Modal, View, Text } from "react-native";

import { useVarsTema } from "@/shared/tema";

import { Botao } from "./botao";

interface PropriedadesModalConfirmacao {
  visivel: boolean;
  titulo: string;
  mensagem: string;
  onConfirm: () => void;
  onCancelar: () => void;
}

export function ModalConfirmacao({
  visivel,
  titulo,
  mensagem,
  onConfirm,
  onCancelar,
}: PropriedadesModalConfirmacao) {
  const varsTema = useVarsTema();

  return (
    <Modal
      transparent
      visible={visivel}
      animationType="fade"
    >
      <View
        style={[{ flex: 1 }, varsTema]}
        className="flex-1 bg-black/70 justify-center items-center p-6"
      >
        <View className="bg-surface rounded-2xl p-5 w-full max-w-[360px] border border-border">
          <Text className="text-text text-base font-medium mb-2">{titulo}</Text>
          <Text className="text-textMuted text-[13px] mb-5">{mensagem}</Text>
          <View className="flex-row gap-2.5">
            <Botao
              label="Cancelar"
              onPress={onCancelar}
              variant="secondary"
              style={{ flex: 1 }}
            />
            <Botao
              label="Confirmar"
              onPress={onConfirm}
              variant="danger"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
