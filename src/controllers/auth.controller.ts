import { Request, Response } from "express";
import { clearRefreshTokenCookie, setRefreshTokenCookie } from "../lib/cookies";
import { sendSuccess } from "../lib/response";
import * as authService from "../services/auth.service";
import { asyncHandler } from "../utils/async-handler";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, tokens } = await authService.register(req.body);
  setRefreshTokenCookie(res, tokens.refreshToken);
  sendSuccess(res, "Registration successful", { user, accessToken: tokens.accessToken }, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, tokens } = await authService.login(req.body);
  setRefreshTokenCookie(res, tokens.refreshToken);
  sendSuccess(res, "Login successful", { user, accessToken: tokens.accessToken });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken ?? req.body?.refreshToken;
  const { user, tokens } = await authService.refreshTokens(refreshToken);
  setRefreshTokenCookie(res, tokens.refreshToken);
  sendSuccess(res, "Tokens refreshed", { user, accessToken: tokens.accessToken });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  clearRefreshTokenCookie(res);
  sendSuccess(res, "Logged out successfully", null);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user!.id);
  sendSuccess(res, "User profile retrieved successfully", user);
});
