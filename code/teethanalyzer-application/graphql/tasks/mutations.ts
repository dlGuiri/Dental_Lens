import * as taskService from "mongoose/tasks/services";

export const taskMutations = {
  createTask: (_: any, args: any) => taskService.createTask(args),

  updateTask: (
    _: any,
    { taskId, ...update }: { taskId: string; [key: string]: any }
  ) => taskService.updateTask(taskId, update),

  deleteTask: (_: any, { taskId }: { taskId: string }) =>
    taskService.deleteTask(taskId),

  toggleTaskComplete: (_: any, { taskId }: { taskId: string }) =>
    taskService.toggleTaskComplete(taskId),
};
