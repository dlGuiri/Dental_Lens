export default /* GraphQL */ `
  type Task {
    _id: ID!
    userId: ID!
    description: String!
    type: String
    completed: Boolean
    dateId: String!
    createdAt: String
    updatedAt: String
  }
`;
