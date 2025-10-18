import * as conversationService from "@/mongoose/conversations/services";
import * as messageService from "@/mongoose/messages/services";

export const chatQueries = {
  getUserConversations: (_: any, { userId }: { userId: string }) =>
    conversationService.getUserConversations(userId),

  getMessages: (_: any, { conversationId }: { conversationId: string }) =>
    messageService.getMessages(conversationId),
};

export const chatMutations = {
  createConversation: (_: any, { participantIds }: { participantIds: string[] }) =>
    conversationService.createConversation(participantIds),

  sendMessage: (
    _: any,
    { conversationId, senderId, content }: { conversationId: string; senderId: string; content: string }
  ) => messageService.createMessage(conversationId, senderId, content),
};
