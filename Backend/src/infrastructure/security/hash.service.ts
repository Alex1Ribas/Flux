import bcrypt from 'bcryptjs';
import { env } from '../../configurations/env/env.config.js';

export class HashService {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, env.BCRYPT_SALT_ROUNDS);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
