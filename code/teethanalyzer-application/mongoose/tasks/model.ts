import mongoose, { model } from "mongoose";
import { TaskSchema, TaskType } from "./schema";

// "Task" is the model name (capitalized), maps to "tasks" collection
const TaskModel = mongoose.models.Task || model<TaskType>("Task", TaskSchema);

export default TaskModel;
