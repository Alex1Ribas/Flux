import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

declare global {
  // eslint-disable-next-line no-var
  var __MONGO_SERVER__: MongoMemoryServer | undefined;
}

export async function connectTestDatabase(): Promise<string> {
  if (!global.__MONGO_SERVER__) {
    global.__MONGO_SERVER__ = await MongoMemoryServer.create();
  }
  const uri = global.__MONGO_SERVER__.getUri();
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
  return uri;
}

export async function disconnectTestDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

export async function stopTestDatabase(): Promise<void> {
  await disconnectTestDatabase();
  if (global.__MONGO_SERVER__) {
    await global.__MONGO_SERVER__.stop();
    global.__MONGO_SERVER__ = undefined;
  }
}

export async function clearTestDatabase(): Promise<void> {
  await Promise.all(
    Object.values(mongoose.connection.collections).map((collection) =>
      collection.deleteMany({}),
    ),
  );
}
