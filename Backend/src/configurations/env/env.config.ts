import { config } from 'dotenv';
import { resolve } from 'node:path';

const envFile =
  process.env.NODE_ENV === 'test'
    ? '.env.test'
    : process.env.ENV_FILE ?? '.env';

config({ path: resolve(process.cwd(), envFile), quiet: true });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.trim();
}

function optionalNumber(key: string, defaultValue: number): number {
  const raw = process.env[key];
  if (!raw?.trim()) {
    return defaultValue;
  }
  const num = Number(raw);
  if (Number.isNaN(num)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return num;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  get MONGODB_URI(): string {
    return requireEnv('MONGODB_URI');
  },
  PORT: optionalNumber('PORT', 3000),
  get JWT_SECRET(): string {
    return requireEnv('JWT_SECRET');
  },
  JWT_EXPIRATION: process.env.JWT_EXPIRATION?.trim() || '7d',
  BCRYPT_SALT_ROUNDS: optionalNumber('BCRYPT_SALT_ROUNDS', 10),
  RATE_LIMIT_WINDOW_MS: optionalNumber('RATE_LIMIT_WINDOW_MS', 900_000),
  RATE_LIMIT_MAX: optionalNumber('RATE_LIMIT_MAX', 10),
} as const;

export type EnvConfig = typeof env;
