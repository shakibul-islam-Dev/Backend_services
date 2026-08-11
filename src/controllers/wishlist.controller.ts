import { Request, Response } from "express";
import { sendSuccess } from "../lib/response";
import * as wishlistService from "../services/wishlist.service";
import { asyncHandler } from "../utils/async-handler";
import { paramString } from "../utils/params";

export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
  const item = await wishlistService.addToWishlist(
    req.user!.id,
    req.body.productId
  );
  sendSuccess(res, "Item added to wishlist", item, 201);
});

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const items = await wishlistService.getWishlist(req.user!.id);
  sendSuccess(res, "Wishlist retrieved successfully", items);
});

export const removeFromWishlist = asyncHandler(
  async (req: Request, res: Response) => {
    const item = await wishlistService.removeFromWishlist(
      paramString(req, "id"),
      req.user!.id
    );
    sendSuccess(res, "Item removed from wishlist", item);
  }
);
