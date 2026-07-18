import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const memoria = new Map<string, string>();

export async function getItem(chave: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return localStorage.getItem(chave);
    } catch {
      return memoria.get(chave) ?? null;
    }
  }

  try {
    return await AsyncStorage.getItem(chave);
  } catch {
    return memoria.get(chave) ?? null;
  }
}

export async function setItem(chave: string, valor: string): Promise<void> {
  memoria.set(chave, valor);

  if (Platform.OS === "web") {
    try {
      localStorage.setItem(chave, valor);
    } catch {
      // fallback em memória
    }
    return;
  }

  try {
    await AsyncStorage.setItem(chave, valor);
  } catch {
    // fallback em memória
  }
}

export async function removeItem(chave: string): Promise<void> {
  memoria.delete(chave);

  if (Platform.OS === "web") {
    try {
      localStorage.removeItem(chave);
    } catch {
      // fallback em memória
    }
    return;
  }

  try {
    await AsyncStorage.removeItem(chave);
  } catch {
    // fallback em memória
  }
}
