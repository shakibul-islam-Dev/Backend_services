import { Request, Response } from "express";
import { sendSuccess } from "../lib/response";
import * as reviewService from "../services/review.service";
import { asyncHandler } from "../utils/async-handler";
import { paramString } from "../utils/params";

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.createReview(req.user!.id, req.body);
  sendSuccess(res, "Review created successfully", review, 201);
});

export const getReviews = asyncHandler(async (req: Request, res: Response) => {
  const result = await reviewService.getReviews(req.query);
  sendSuccess(res, "Reviews retrieved successfully", result.data, 200, result.meta);
});

export const getReviewById = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.getReviewById(paramString(req, "id"));
  sendSuccess(res, "Review retrieved successfully", review);
});

export const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === "ADMIN";
  const review = await reviewService.updateReview(
    paramString(req, "id"),
    req.user!.id,
    isAdmin,
    req.body
  );
  sendSuccess(res, "Review updated successfully", review);
});

export const updateReviewStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const review = await reviewService.updateReviewStatus(
      paramString(req, "id"),
      req.body.status
    );
    sendSuccess(res, "Review status updated successfully", review);
  }
);

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === "ADMIN";
  const review = await reviewService.softDeleteReview(
    paramString(req, "id"),
    req.user!.id,
    isAdmin
  );
  sendSuccess(res, "Review deleted successfully", review);
});
