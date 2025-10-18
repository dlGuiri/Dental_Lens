export default /* GraphQL */ `
  getUserConversations(userId: ID!): [Conversation]
  getMessages(conversationId: ID!): [Message]
`;
