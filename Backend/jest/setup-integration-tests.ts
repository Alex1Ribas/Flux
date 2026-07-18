import mongoose from 'mongoose';
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
