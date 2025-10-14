export default /* GraphQL */ `
  enum Role {
    PATIENT
    DENTIST
  }

  type User {
    _id: ID!
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
