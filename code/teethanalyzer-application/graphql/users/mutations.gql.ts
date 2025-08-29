export default /* GraphQL */ `
    createUser(
      oauthProvider: String!
      oauthId: String!
      name: String!
      email: String!
      avatarUrl: String
      teeth_status: String
      role: Role
    ): User

    updateUser(
      userId: ID!
      name: String
      email: String
      avatarUrl: String
      teeth_status: String
      role: Role
    ): User

    deleteUser(userId: ID!): User
`;
