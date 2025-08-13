export default /* GraphQL */ `
  getTasksByUserAndDate(userId: ID!, dateId: String!): [Task]
  getTasksByUserAndMonth(userId: ID!, month: Int!, year: Int!): [Task]
`;