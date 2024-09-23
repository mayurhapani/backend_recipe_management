import { taskModel } from "../models/task.model.js";
import { ApiError } from "../utils/apiError.js";

export const insertTasks = async (tasks) => {
  try {
    await taskModel.insertMany(tasks);
  } catch (error) {
    throw new ApiError(500, "Error inserting tasks into the database");
  }
};
