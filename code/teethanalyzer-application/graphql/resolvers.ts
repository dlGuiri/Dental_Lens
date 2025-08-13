// graphql/resolvers.ts

import { userQueries } from "./users/queries";
import { userMutations } from "./users/mutations";

import { scanRecordQueries } from "./scanRecords/queries";
import { scanRecordMutations } from "./scanRecords/mutations";

import { taskQueries } from "./tasks/queries";
import { taskMutations } from "./tasks/mutations";

export const resolvers = {
  Query: {
    ...userQueries,
    ...scanRecordQueries,
    ...taskQueries,
  },
  Mutation: {
    ...userMutations,
    ...scanRecordMutations,
    ...taskMutations,
  },
};
