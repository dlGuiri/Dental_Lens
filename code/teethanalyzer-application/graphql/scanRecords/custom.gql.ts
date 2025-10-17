export default /* GraphQL */ `
  type ScanRecord {
    _id: ID!
    user: User!
    date: String
    notes: [String]
    imageUrls: [String]
    limeVisualizationUrl: String
    result: [String]
    createdAt: String
    updatedAt: String
  }
`;
