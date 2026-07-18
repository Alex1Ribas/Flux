import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cached: MongooseCache = globalForMongoose.mongooseCache ?? {
  conn: null,
  promise: null,
};

globalForMongoose.mongooseCache = cached;

export async function connectDatabase(uri: string): Promise<void> {
  if (cached.conn) {
    return;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri).then(async (connection) => {
      await migrateUserRoles();
      return connection;
    });
  }

  cached.conn = await cached.promise;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  cached.conn = null;
  cached.promise = null;
}

/** One-shot: legacy ADMIN/USER roles → USER (titular) / DEPENDENT. */
async function migrateUserRoles(): Promise<void> {
  const collection = mongoose.connection.collection('users');
  await collection.updateMany({ role: 'USER' }, { $set: { role: 'DEPENDENT' } });
  await collection.updateMany({ role: 'ADMIN' }, { $set: { role: 'USER' } });
}
