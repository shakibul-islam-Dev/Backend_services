import { Request, Response } from "express";
import { sendSuccess } from "../lib/response";
import * as productService from "../services/product.service";
import { asyncHandler } from "../utils/async-handler";
import { paramString } from "../utils/params";

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.user!.id, req.body);
  sendSuccess(res, "Product created successfully", product, 201);
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.getProducts(req.query);
  sendSuccess(res, "Products retrieved successfully", result.data, 200, result.meta);
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductById(paramString(req, "id"));
  sendSuccess(res, "Product retrieved successfully", product);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === "ADMIN";
  const product = await productService.updateProduct(
    paramString(req, "id"),
    req.user!.id,
    isAdmin,
    req.body
  );
  sendSuccess(res, "Product updated successfully", product);
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === "ADMIN";
  const product = await productService.softDeleteProduct(
    paramString(req, "id"),
    req.user!.id,
    isAdmin
  );
  sendSuccess(res, "Product deleted successfully", product);
});
