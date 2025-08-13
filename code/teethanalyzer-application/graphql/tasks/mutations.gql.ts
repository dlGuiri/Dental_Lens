export default /* GraphQL */ `
  createTask(
    userId: ID!
    description: String!
    type: String
    completed: Boolean
    dateId: String!
  ): Task

  updateTask(
    taskId: ID!
    description: String
    type: String
    completed: Boolean
    dateId: String
  ): Task

  deleteTask(taskId: ID!): Task

  toggleTaskComplete(taskId: ID!): Task
`;
