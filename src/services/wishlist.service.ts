import prisma from "../lib/prisma";
import { ApiError } from "../utils/api-error";

export async function addToWishlist(userId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, isDeleted: false },
  });
  if (!product) throw ApiError.badRequest("Product does not exist");

  const existing = await prisma.wishlist.findFirst({
    where: { userId, productId },
  });
  if (existing) {
    return prisma.wishlist.findUnique({
      where: { id: existing.id },
      include: { product: { include: { category: true } } },
    });
  }

  return prisma.wishlist.create({
    data: { userId, productId },
    include: { product: { include: { category: true } } },
  });
}

export async function getWishlist(userId: string) {
  return prisma.wishlist.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function removeFromWishlist(id: string, userId: string) {
  const item = await prisma.wishlist.findFirst({
    where: { id, userId },
  });
  if (!item) throw ApiError.notFound("Wishlist item not found");

  return prisma.wishlist.delete({ where: { id: item.id } });
}
