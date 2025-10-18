import mongoose, { model } from "mongoose";
import { ConversationSchema, ConversationType } from "./schema";

const ConversationModel =
  mongoose.models.Conversation ||
  model<ConversationType>("Conversation", ConversationSchema);

export default ConversationModel;
