import mongoose, { model } from "mongoose";
import { MessageSchema, MessageType } from "./schema";

const MessageModel =
  mongoose.models.Message || model<MessageType>("Message", MessageSchema);

export default MessageModel;
