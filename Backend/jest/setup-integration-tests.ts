import mongoose from 'mongoose';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret';
process.env.BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS ?? '4';
process.env.RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX ?? '1000';
import { connectTestDatabase, disconnectTestDatabase } from './setup-db.js';

async function deleteManyTestCollections(): Promise<void> {
  await Promise.all(
    Object.values(mongoose.connection.collections).map((collection) =>
      collection.deleteMany({}),
    ),
  );
}

beforeAll(async () => {
  const uri = await connectTestDatabase();
  process.env.MONGODB_URI = uri;
});

afterAll(async () => {
  await disconnectTestDatabase();
});

beforeEach(async () => {
  await deleteManyTestCollections();
});

afterEach(async () => {
  await deleteManyTestCollections();
});
