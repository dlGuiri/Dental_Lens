import { Schema, model, models, InferSchemaType } from "mongoose";

export const ScanRecordSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: [
      {
        type: String,
      }
    ],
    imageUrls: [
      {
        type: String,
      },
    ],
    limeVisualizationUrl: {
      type: String,
    },
    result: [
      {
        type: String,
      }
    ],
  },
  { timestamps: true }
);

export type ScanRecordType = InferSchemaType<typeof ScanRecordSchema>;