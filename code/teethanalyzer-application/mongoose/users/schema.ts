import { Schema, InferSchemaType } from "mongoose";

export const UserSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: false,
    },
    avatarUrl: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ["patient", "dentist"],
      default: "patient",
      required: true,
    },
    teeth_status: {
      type: String,
      required: false,
    },
    scanRecords: [
      {
        type: Schema.Types.ObjectId,
        ref: "ScanRecord", // Mongoose will use this string to find the model
      },
    ],
  },
  { timestamps: true }
);

export type UserType = InferSchemaType<typeof UserSchema>;
