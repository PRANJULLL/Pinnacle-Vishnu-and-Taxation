import mongoose, { Document, Schema } from "mongoose";

export interface IClient extends Document {
  name: string;
}

const ClientSchema = new Schema<IClient>({
  name: { type: String, required: true, unique: true },
});

export default mongoose.model<IClient>("Client", ClientSchema);
