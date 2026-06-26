import mongoose, { Document, Schema } from "mongoose";

export interface IEmployee extends Document {
  name: string;
}

const EmployeeSchema = new Schema<IEmployee>({
  name: { type: String, required: true, unique: true },
});

export default mongoose.model<IEmployee>("Employee", EmployeeSchema);
