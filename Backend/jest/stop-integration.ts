import mongoose from 'mongoose';

export default async function globalTeardown(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (global.__MONGO_SERVER__) {
    await global.__MONGO_SERVER__.stop();
    global.__MONGO_SERVER__ = undefined;
  }
}
