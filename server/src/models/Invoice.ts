import mongoose, { Document, Schema } from "mongoose";

export interface IInvoice extends Document {
  invoiceNumber: string;
  taskId: mongoose.Types.ObjectId;
  customerName: string;
  amount: number;
  plan: string;
  pdfPath?: string;
  createdAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    customerName: { type: String, required: true },
    amount: { type: Number, required: true },
    plan: { type: String, required: true },
    pdfPath: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IInvoice>("Invoice", InvoiceSchema);
