import mongoose from "mongoose";

let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

const connectDB = async () => {
  if (cached.conn) return cached.conn;
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not defined");

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
  return cached.conn;
};

export default connectDB;