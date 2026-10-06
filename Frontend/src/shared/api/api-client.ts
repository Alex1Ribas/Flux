import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/shared/config/env';

type TTokenProvider = () => string | null;
type TUnauthorizedHandler = () => void;

let tokenProvider: TTokenProvider = () => null;
let unauthorizedHandler: TUnauthorizedHandler = () => undefined;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = tokenProvider();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (error instanceof AxiosError && error.response?.status === 401 && tokenProvider()) {
      unauthorizedHandler();
    }
    return Promise.reject(error);
  },
);

export const configureApiAuth = (
  provider: TTokenProvider,
  onUnauthorized: TUnauthorizedHandler,
) => {
  tokenProvider = provider;
  unauthorizedHandler = onUnauthorized;
};

export const apiErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as { message?: unknown } | undefined)?.message;
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }
  return fallback;
};
