import Conversation from "./model";
import Message from "@/mongoose/messages/model";
import { ConversationType } from "./schema";

// Create a new conversation
export async function createConversation(participantIds: string[]) {
  // Check if conversation already exists
  const existing = await Conversation.findOne({
    participants: { $all: participantIds, $size: participantIds.length },
  });

  if (existing) return existing;

  return await Conversation.create({ participants: participantIds });
}

// Get all conversations for a user
export async function getUserConversations(userId: string) {
  return await Conversation.find({ participants: userId })
    .populate("participants")
    .populate({
      path: "lastMessage",
      populate: { path: "sender", model: "User" },
    })
    .sort({ updatedAt: -1 });
}

// Get conversation by ID
export async function getConversationById(conversationId: string) {
  return await Conversation.findById(conversationId)
    .populate("participants")
    .populate({
      path: "lastMessage",
      populate: { path: "sender", model: "User" },
    });
}

// Update last message reference
export async function updateLastMessage(conversationId: string, messageId: string) {
  return await Conversation.findByIdAndUpdate(
    conversationId,
    { lastMessage: messageId },
    { new: true }
  );
}

