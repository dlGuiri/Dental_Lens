export default /* GraphQL */ `
  type Conversation {
    _id: ID!
    participants: [User!]!
    lastMessage: Message
    createdAt: String
    updatedAt: String
  }

  type Message {
    _id: ID!
    conversation: Conversation!
    sender: User!
    content: String!
    isRead: Boolean
    createdAt: String
    updatedAt: String
  }
`;
