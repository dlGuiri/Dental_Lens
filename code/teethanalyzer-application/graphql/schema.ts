import gql from "graphql-tag";

import userTypeDefsCustom from "./users/custom.gql";
import userTypeDefsQueries from "./users/queries.gql";
import userTypeDefsMutations from "./users/mutations.gql";

import scanRecordTypeDefsCustom from "./scanRecords/custom.gql";
import scanRecordTypeDefsQueries from "./scanRecords/queries.gql";
import scanRecordTypeDefsMutations from "./scanRecords/mutations.gql";

import taskTypeDefsCustom from "./tasks/custom.gql";
import taskTypeDefsQueries from "./tasks/queries.gql";
import taskTypeDefsMutations from "./tasks/mutations.gql";

import chatTypeDefsCustom from "./chat/custom.gql";
import chatTypeDefsQueries from "./chat/queries.gql";
import chatTypeDefsMutations from "./chat/mutations.gql";

export const typeDefs = gql`
  # Custom Types
  ${userTypeDefsCustom}
  ${scanRecordTypeDefsCustom}
  ${taskTypeDefsCustom}
  ${chatTypeDefsCustom}

  # Root Query Type
  type Query {
    ${userTypeDefsQueries}
    ${scanRecordTypeDefsQueries}
    ${taskTypeDefsQueries}
    ${chatTypeDefsQueries}
  }

  # Root Mutation Type
  type Mutation {
    ${userTypeDefsMutations}
    ${scanRecordTypeDefsMutations}
    ${taskTypeDefsMutations}
    ${chatTypeDefsMutations}
  }
`;
