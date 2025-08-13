import { Schema, InferSchemaType } from "mongoose";

export const TaskSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String, required: true },
  type: { type: String },
  completed: { type: Boolean, default: false },
  dateId: { type: String, required: true },
}, { timestamps: true });

export type TaskType = InferSchemaType<typeof TaskSchema>;
