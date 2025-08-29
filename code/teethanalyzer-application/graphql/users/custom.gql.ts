export default /* GraphQL */ `
  enum Role {
    PATIENT
    DENTIST
  }

  type User {
    _id: ID!
    oauthProvider: String!
    oauthId: String!
    name: String!
    email: String!
    avatarUrl: String
    role: Role!
    teeth_status: String
    scanRecords: [ScanRecord]
    createdAt: String
    updatedAt: String
  }
`;
