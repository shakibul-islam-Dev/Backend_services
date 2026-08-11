import { Request, Response } from "express";
import { sendSuccess } from "../lib/response";
import * as categoryService from "../services/category.service";
import { asyncHandler } from "../utils/async-handler";
import { paramString } from "../utils/params";

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body);
  sendSuccess(res, "Category created successfully", category, 201);
});

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const result = await categoryService.getCategories(req.query);
  sendSuccess(res, "Categories retrieved successfully", result.data, 200, result.meta);
});

export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getCategoryById(paramString(req, "id"));
  sendSuccess(res, "Category retrieved successfully", category);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.updateCategory(paramString(req, "id"), req.body);
  sendSuccess(res, "Category updated successfully", category);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.softDeleteCategory(paramString(req, "id"));
  sendSuccess(res, "Category deleted successfully", category);
});
