import { Request, Response } from "express";
import { sendSuccess } from "../lib/response";
import * as userService from "../services/user.service";
import { asyncHandler } from "../utils/async-handler";
import { paramString } from "../utils/params";

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.getUsers(req.query);
  sendSuccess(res, "Users retrieved successfully", result.data, 200, result.meta);
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(paramString(req, "id"));
  sendSuccess(res, "User retrieved successfully", user);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateProfile(req.user!.id, req.body);
  sendSuccess(res, "Profile updated successfully", user);
});

export const updateUserByAdmin = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateUserByAdmin(paramString(req, "id"), req.body);
  sendSuccess(res, "User updated successfully", user);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === "ADMIN";
  const user = await userService.softDeleteUser(paramString(req, "id"), isAdmin);
  sendSuccess(res, "User deleted successfully", user);
});
