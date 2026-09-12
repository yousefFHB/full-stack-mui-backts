import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = env.databaseUrl || process.env.DATA_BASE;

    if (!mongoURI) {
      throw new Error("DATA_BASE is not defined in environment variables");
    }

    await mongoose.connect(mongoURI);

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};