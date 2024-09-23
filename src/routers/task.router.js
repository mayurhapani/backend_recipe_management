import { Router } from "express";
import {
  addTask,
  deleteTask,
  updateTask,
  completeTask,
  getTasks,
  importTasks,
  exportTasks,
} from "../controllers/task.controller.js";

import { isAuth } from "../middlewares/isAuth.middleware.js";
import upload from "../middlewares/multer.js";

const taskRouter = Router();

// Define your routes here
taskRouter.post("/register", isAuth, addTask);
taskRouter.delete("/delete/:_id", isAuth, deleteTask);
taskRouter.patch("/update/:_id", isAuth, updateTask);
taskRouter.patch("/complete/:_id", isAuth, completeTask);
taskRouter.get("/getTasks", isAuth, getTasks);
taskRouter.post("/import", isAuth, upload.single("file"), importTasks);
taskRouter.get("/export", isAuth, exportTasks);

export { taskRouter };
