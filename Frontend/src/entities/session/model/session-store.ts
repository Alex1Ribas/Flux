import { create } from 'zustand';
import {
  getStoredItem,
  removeStoredItem,
  setStoredItem,
} from '@/shared/lib/storage';

export const SESSION_TOKEN_KEY = 'finance_api_token';
export const SESSION_USER_ID_KEY = 'finance_api_usuario_id';

export type TSessionStatus = 'loading' | 'authenticated' | 'anonymous';

interface ISessionStore {
  status: TSessionStatus;
  token: string | null;
  userId: string | null;
  hydrate: () => Promise<void>;
  signIn: (token: string, userId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useSessionStore = create<ISessionStore>((set) => ({
  status: 'loading',
  token: null,
  userId: null,
  hydrate: async () => {
    const [token, userId] = await Promise.all([
      getStoredItem(SESSION_TOKEN_KEY),
      getStoredItem(SESSION_USER_ID_KEY),
    ]);
    if (token && userId) {
      set({ status: 'authenticated', token, userId });
      return;
    }
    set({ status: 'anonymous', token: null, userId: null });
  },
  signIn: async (token, userId) => {
    await Promise.all([
      setStoredItem(SESSION_TOKEN_KEY, token),
      setStoredItem(SESSION_USER_ID_KEY, userId),
    ]);
    set({ status: 'authenticated', token, userId });
  },
  signOut: async () => {
    await Promise.all([
      removeStoredItem(SESSION_TOKEN_KEY),
      removeStoredItem(SESSION_USER_ID_KEY),
    ]);
    set({ status: 'anonymous', token: null, userId: null });
  },
}));
