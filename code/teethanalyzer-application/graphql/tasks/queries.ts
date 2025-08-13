import * as taskService from "mongoose/tasks/services";

export const taskQueries = {
  getTasksByUserAndDate: (
    _: any,
    { userId, dateId }: { userId: string; dateId: string }
  ) => taskService.getTasksByUserAndDate(userId, dateId),
  
  getTasksByUserAndMonth: (
    _: any,
    { userId, month, year }: { userId: string; month: number; year: number }
  ) => taskService.getTasksByUserAndMonth(userId, month, year),
};