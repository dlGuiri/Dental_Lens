import { Schema, InferSchemaType } from "mongoose";

export const ConversationSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

export type ConversationType = InferSchemaType<typeof ConversationSchema>;
