export default /* GraphQL */ `
  createConversation(participantIds: [ID!]!): Conversation
  sendMessage(conversationId: ID!, senderId: ID!, content: String!): Message
`;
