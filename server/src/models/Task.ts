import mongoose, { Document, Schema } from "mongoose";

export type TaskStatus = "Pending" | "Completed" | "Stuck";

export interface ITask extends Document {
  orderId: string;
  client: string;
  customerName: string;
  pan: string;
  phone: string;
  email: string;
  plan: string;
  amount: number;
  taxExpert: string;
  status: TaskStatus;
  remarks?: string;
  createdAt: Date;
  completedAt?: Date;
  invoiceId?: mongoose.Types.ObjectId;
  reference?: string;
}

const TaskSchema = new Schema<ITask>(
  {
    orderId: { type: String, required: true, unique: true },
    client: { type: String, required: true },
    customerName: { type: String, required: true },
    pan: { type: String, default: "" },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    plan: { type: String, required: true },
    amount: { type: Number, required: true },
    taxExpert: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Stuck"],
      default: "Pending",
    },
    remarks: { type: String, default: "" },
    reference: { type: String, default: "" },
    completedAt: { type: Date },
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice" },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export default mongoose.model<ITask>("Task", TaskSchema);
