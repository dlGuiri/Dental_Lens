import Message from "./model";
import { MessageType } from "./schema";
import { updateLastMessage } from "../conversations/services";

// Create a new message and update conversation
export async function createMessage(
  conversationId: string,
  senderId: string,
  content: string
) {
  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    content,
  });

  // Update the last message in the conversation
  await updateLastMessage(conversationId, message._id);

  return message.populate("sender");
}

// Get messages in a conversation
export async function getMessages(conversationId: string) {
  return await Message.find({ conversation: conversationId })
    .populate("sender")
    .sort({ createdAt: 1 });
}

// Mark messages as read
export async function markMessagesAsRead(conversationId: string, userId: string) {
  return await Message.updateMany(
    { conversation: conversationId, sender: { $ne: userId }, isRead: false },
    { $set: { isRead: true } }
  );
}
