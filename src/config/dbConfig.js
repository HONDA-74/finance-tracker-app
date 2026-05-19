import 'dotenv/config';
import mongoose from "mongoose";

const DB_URL = process.env.DB_URL;

if (!DB_URL) {
  throw new Error("DB_URL is not defined in the environment variables.");
}

let cachedPromise = null;

const connectDB = async () => {
  const state = mongoose.connection.readyState;

  // 1 = Connected
  if (state === 1) {
    return mongoose.connection;
  }

  // 2 = Connecting (reuse the connection promise)
  if (state === 2) {
    return cachedPromise;
  }

  // 0 = Disconnected, 3 = Disconnecting (reconnect)
  if (state === 0 || state === 3) {
    cachedPromise = mongoose.connect(DB_URL)
      .then((mongooseInstance) => {
        console.log("Connected to MongoDB");
        return mongooseInstance;
      })
      .catch((err) => {
        console.error("Failed to connect to MongoDB", err);
        cachedPromise = null;
        throw err;
      });
  }

  return cachedPromise;
};

export default connectDB;