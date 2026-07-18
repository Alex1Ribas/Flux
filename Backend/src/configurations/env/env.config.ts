import { config } from 'dotenv';
import { resolve } from 'node:path';

const envFile =
  process.env.NODE_ENV === 'test'
    ? '.env.test'
    : process.env.ENV_FILE ?? '.env';

config({ path: resolve(process.cwd(), envFile) });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.trim();
}

function requireNumber(key: string): number {
  const raw = requireEnv(key);
  const num = Number(raw);
  if (Number.isNaN(num)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return num;
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
  MONGODB_URI: requireEnv('MONGODB_URI'),
  PORT: requireNumber('PORT'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_EXPIRATION: requireEnv('JWT_EXPIRATION'),
  BCRYPT_SALT_ROUNDS: requireNumber('BCRYPT_SALT_ROUNDS'),
  RATE_LIMIT_WINDOW_MS: optionalNumber('RATE_LIMIT_WINDOW_MS', 900_000),
  RATE_LIMIT_MAX: optionalNumber('RATE_LIMIT_MAX', 10),
} as const;

export type EnvConfig = typeof env;
