import mongoose from 'mongoose';
import { EUserRole } from '../../../../../../domain/user/entity/interfaces/user.interface.js';
import { MUser } from '../../../../../../infrastructure/db/mongo/models/user.model.js';

describe('user.schema', () => {
  beforeAll(() => {
    if (mongoose.connection.readyState === 0) {
      // Schema validation only; no persistent connection required
    }
  });

  it('should validate a valid user document', async () => {
    const doc = new MUser({
      name: 'Alex',
      email: 'alex@example.com',
      password: 'hashed-secret',
      role: EUserRole.USER,
    });

    await expect(doc.validate()).resolves.toBeUndefined();
  });

  it('should reject invalid role enum', async () => {
    const doc = new MUser({
      name: 'Alex',
      email: 'alex2@example.com',
      password: 'hashed-secret',
      role: 'INVALID' as EUserRole,
    });

    await expect(doc.validate()).rejects.toThrow();
  });

  it('should require name, email and password', async () => {
    const doc = new MUser({});

    const error = await doc.validate().catch((err: Error) => err);
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should default role to USER (titular)', () => {
    const doc = new MUser({
      name: 'Titular User',
      email: 'titular@example.com',
      password: 'hashed-secret',
    });

    expect(doc.role).toBe(EUserRole.USER);
  });
});
