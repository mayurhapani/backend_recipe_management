import { Router } from "express";
import {
  registerUser,
  deleteUser,
  updateUser,
  login,
  logout,
  getUser,
  getAllUsers,
  updateFcmToken,
  sendTestNotification,
} from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/isAuth.middleware.js";
import { sendTaskNotification } from "../helpers/firebaseAdmin.js";
import { userModel } from "../models/user.model.js";

const userRouter = Router();

// Define your routes here

userRouter.post("/register", registerUser);
userRouter.delete("/delete/:_id", isAuth, deleteUser);
userRouter.patch("/update/:_id", isAuth, updateUser);

userRouter.post("/login", login);
userRouter.get("/logout", isAuth, logout);

userRouter.get("/getUser", isAuth, getUser);
userRouter.get("/getAllUsers", isAuth, getAllUsers);

// Route to update FCM token
userRouter.patch("/updateFcmToken", isAuth, updateFcmToken);

// New route for sending test notification
userRouter.post("/sendTestNotification", isAuth, sendTestNotification);

export { userRouter };
