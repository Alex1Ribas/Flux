import { useEffect, useState } from "react";
import { Platform } from "react-native";
import * as Updates from "expo-updates";

const TIMEOUT_CHECAGEM_MS = 7000;

export type EstadoAtualizacaoOta = "verificando" | "baixando" | "pronto";

function comTimeout<T>(promessa: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Timeout na checagem de atualização"));
    }, ms);

    promessa
      .then((valor) => {
        clearTimeout(timer);
        resolve(valor);
      })
      .catch((erro: unknown) => {
        clearTimeout(timer);
        reject(erro);
      });
  });
}

function updatesHabilitados(): boolean {
  if (__DEV__) {
    return false;
  }
  if (Platform.OS === "web") {
    return false;
  }
  return Updates.isEnabled;
}

export function useAtualizacaoOta(): EstadoAtualizacaoOta {
  const [estado, setEstado] = useState<EstadoAtualizacaoOta>(() =>
    updatesHabilitados() ? "verificando" : "pronto",
  );

  useEffect(() => {
    if (!updatesHabilitados()) {
      return;
    }

    let cancelado = false;

    async function executar() {
      try {
        const resultado = await comTimeout(
          Updates.checkForUpdateAsync(),
          TIMEOUT_CHECAGEM_MS,
        );

        if (cancelado) {
          return;
        }

        if (!resultado.isAvailable) {
          setEstado("pronto");
          return;
        }

        setEstado("baixando");
        await Updates.fetchUpdateAsync();

        if (cancelado) {
          return;
        }

        await Updates.reloadAsync();
      } catch {
        if (!cancelado) {
          setEstado("pronto");
        }
      }
    }

    void executar();

    return () => {
      cancelado = true;
    };
  }, []);

  return estado;
}
