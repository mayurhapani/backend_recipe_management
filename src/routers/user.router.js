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
userRouter.post("/sendTestNotification", isAuth, async (req, res) => {
  try {
    // Get the user's FCM token from the database
    const user = await userModel.findById(req.user._id);
    if (!user || !user.fcmToken) {
      return res.status(400).json({ error: "User FCM token not found" });
    }

    console.log("Attempting to send notification to token:", user.fcmToken);

    const result = await sendTaskNotification(
      user.fcmToken,
      "Test Notification",
      "This is a test notification"
    );

    console.log("Notification send result:", result);

    res.status(200).json({ message: "Test notification sent successfully", result });
  } catch (error) {
    console.error("Detailed error in sendTestNotification:", error);
    res.status(500).json({
      error: "Failed to send test notification",
      details: error.message,
    });
  }
});

export { userRouter };
