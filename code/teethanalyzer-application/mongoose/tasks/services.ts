import Task from "./model";
import { TaskType } from "./schema";

// Create a new task and associate it with a user
export async function createTask(taskData: Partial<TaskType>) {
  return await Task.create(taskData);
}

// Get all tasks for a specific user on a specific date
export async function getTasksByUserAndDate(userId: string, dateId: string) {
  return await Task.find({ userId, dateId });
}

// Get all tasks for a specific user in a specific month
export async function getTasksByUserAndMonth(userId: string, month: number, year: number) {
  // Create regex pattern to match dateId format: dayMonth (e.g., "15" + "0" for January 15th)
  const monthStr = month.toString();
  const dateIdPattern = new RegExp(`\\d+${monthStr}$`);
  
  return await Task.find({ 
    userId, 
    dateId: { $regex: dateIdPattern }
  });
}

// Update a task
export async function updateTask(taskId: string, update: Partial<TaskType>) {
  return await Task.findByIdAndUpdate(taskId, update, { new: true });
}

// Delete a task
export async function deleteTask(taskId: string) {
  return await Task.findByIdAndDelete(taskId);
}

// Toggle task completion
export async function toggleTaskComplete(taskId: string) {
  const task = await Task.findById(taskId);
  if (!task) return null;
  task.completed = !task.completed;
  return await task.save();
}