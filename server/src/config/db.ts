import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/office-management";
  await mongoose.connect(uri);
  console.log("MongoDB connected");
};
