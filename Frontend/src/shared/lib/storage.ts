import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const memory = new Map<string, string>();

interface IWebStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function webStorage(): IWebStorage | null {
  if (Platform.OS !== 'web') {
    return null;
  }
  const candidate = (globalThis as { localStorage?: IWebStorage }).localStorage;
  return candidate ?? null;
}

export async function getStoredItem(key: string): Promise<string | null> {
  try {
    const browserStorage = webStorage();
    if (browserStorage) {
      return browserStorage.getItem(key);
    }
    return await AsyncStorage.getItem(key);
  } catch {
    return memory.get(key) ?? null;
  }
}

export async function setStoredItem(key: string, value: string): Promise<void> {
  memory.set(key, value);
  try {
    const browserStorage = webStorage();
    if (browserStorage) {
      browserStorage.setItem(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  } catch {
    return;
  }
}

export async function removeStoredItem(key: string): Promise<void> {
  memory.delete(key);
  try {
    const browserStorage = webStorage();
    if (browserStorage) {
      browserStorage.removeItem(key);
      return;
    }
    await AsyncStorage.removeItem(key);
  } catch {
    return;
  }
}
