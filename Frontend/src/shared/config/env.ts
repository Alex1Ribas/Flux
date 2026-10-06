import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEV_API_URL = 'http://localhost:3000/api';
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '10.0.2.2'];

interface IExpoExtra {
  fluxApiBaseUrl?: string;
}

const isLocalUrl = (url: string): boolean => LOCAL_HOSTS.some((host) => url.includes(host));

function resolveDevelopmentUrl(fromEnv: string | undefined): string {
  const url = fromEnv || DEV_API_URL;
  if (Platform.OS === 'android' && url.includes('localhost')) {
    return url.replace('localhost', '10.0.2.2');
  }
  return url;
}

function resolveProductionUrl(fromEnv: string | undefined): string {
  if (fromEnv && !isLocalUrl(fromEnv)) {
    return fromEnv;
  }
  const extra = Constants.expoConfig?.extra as IExpoExtra | undefined;
  return extra?.fluxApiBaseUrl ?? '';
}

function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_FLUX_API_URL;
  if (__DEV__) {
    return resolveDevelopmentUrl(fromEnv);
  }
  return resolveProductionUrl(fromEnv);
}

export const API_BASE_URL = resolveApiBaseUrl();
