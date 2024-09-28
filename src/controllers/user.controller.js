import { userModel } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if ([name, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await userModel.findOne({ email });

  if (existedUser) throw new ApiError(409, "User with email already exists");

  const user = await userModel.create({ name, email, password });

  const createdUser = await userModel.findById(user._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
  const { _id } = req.params;

  const user = await userModel.findById(_id);
  if (!user) throw new ApiError(404, "User not found");

  const deletedUser = await userModel.findByIdAndDelete(_id);

  return res
    .status(200)
    .json(new ApiResponse(200, deletedUser, "User deleted successfully"));
});

const updateUser = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const { _id } = req.params;

  const user = await userModel.findByIdAndUpdate(_id, { name, email }, { new: true });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully"));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await userModel.findOne({ email });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRY });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { user, token }, "User login successfully"));
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "None",
  });

  return res.status(200).json(new ApiResponse(200, null, "User logged out successfully"));
});

const getUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "User is not authenticated"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User data retrieved successfully"));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userModel.find({});

  return res
    .status(200)
    .json(new ApiResponse(200, users, "User data retrieved successfully"));
});

const updateFcmToken = asyncHandler(async (req, res) => {
  const { fcmToken } = req.body;
  const userId = req.user._id;

  if (!fcmToken) {
    throw new ApiError(400, "FCM token is required");
  }

  const updatedUser = await userModel
    .findByIdAndUpdate(userId, { fcmToken }, { new: true })
    .select("-password");

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "FCM token updated successfully"));
});

const sendTestNotification = asyncHandler(async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user || !user.fcmToken) {
      return res.status(400).json({ error: "User FCM token not found" });
    }

    const result = await sendTaskNotification(
      user.fcmToken,
      "Test Notification",
      "This is a test notification"
    );

    res
      .status(200)
      .json({ message: "Test notification sent successfully", result });
  } catch (error) {
    res.status(500).json({
      error: "Failed to send test notification",
      details: error.message,
    });
  }
});

export {
  registerUser,
  login,
  logout,
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
  updateFcmToken,
  sendTestNotification,
};