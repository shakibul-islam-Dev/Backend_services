import { Request, Response } from "express";
import { sendSuccess } from "../lib/response";
import * as orderService from "../services/order.service";
import { asyncHandler } from "../utils/async-handler";
import { paramString } from "../utils/params";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.createOrder(req.user!.id, req.body);
  sendSuccess(res, "Order created successfully", order, 201);
});

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === "ADMIN";
  const result = await orderService.getOrders(
    req.query,
    req.user!.id,
    isAdmin
  );
  sendSuccess(res, "Orders retrieved successfully", result.data, 200, result.meta);
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === "ADMIN";
  const order = await orderService.getOrderById(
    paramString(req, "id"),
    req.user!.id,
    isAdmin
  );
  sendSuccess(res, "Order retrieved successfully", order);
});

export const updateOrder = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === "ADMIN";
  const order = await orderService.updateOrder(paramString(req, "id"), req.body, isAdmin);
  sendSuccess(res, "Order updated successfully", order);
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === "ADMIN";
  const order = await orderService.cancelOrder(
    paramString(req, "id"),
    req.user!.id,
    isAdmin
  );
  sendSuccess(res, "Order cancelled successfully", order);
});

export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.softDeleteOrder(paramString(req, "id"));
  sendSuccess(res, "Order deleted successfully", order);
});
