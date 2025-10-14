import * as userService from "mongoose/users/services";

export const userQueries = {
  getUserById: (_: any, { userId }: { userId: string }) =>
    userService.findUserById(userId),
  getAllUsers: () => 
    userService.findAllUsers(),
  getUserCount: () =>
    userService.getUserCount(),
};
