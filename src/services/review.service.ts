import { Prisma } from "../generated/prisma/client";
import { ReviewStatus } from "../generated/prisma/enums";
import prisma from "../lib/prisma";
import { ApiError } from "../utils/api-error";
import { getPagination, PaginationQuery } from "../utils/pagination";

export interface CreateReviewInput {
  rating: number;
  title?: string;
  comment?: string;
  productId: string;
}

export interface UpdateReviewInput {
  rating?: number;
  title?: string;
  comment?: string;
}

export interface ListReviewsQuery extends PaginationQuery {
  productId?: string;
  userId?: string;
  status?: string;
}

async function ensureProductExists(productId: string): Promise<void> {
  const product = await prisma.product.findFirst({
    where: { id: productId, isDeleted: false },
  });
  if (!product) throw ApiError.badRequest("Product does not exist");
}

export async function createReview(userId: string, input: CreateReviewInput) {
  await ensureProductExists(input.productId);

  const existing = await prisma.review.findFirst({
    where: { userId, productId: input.productId },
  });
  if (existing) {
    throw ApiError.conflict("You have already reviewed this product");
  }

  return prisma.review.create({
    data: {
      rating: input.rating,
      title: input.title,
      comment: input.comment,
      status: ReviewStatus.PENDING,
      userId,
      productId: input.productId,
    },
    include: {
      user: { select: { id: true, name: true, username: true, avatar: true } },
      product: { select: { id: true, title: true, slug: true } },
    },
  });
}

export async function getReviews(query: ListReviewsQuery) {
  const { page, limit, skip, take } = getPagination(query);

  const where: Prisma.ReviewWhereInput = {
    isDeleted: false,
    ...(query.productId ? { productId: query.productId } : {}),
    ...(query.userId ? { userId: query.userId } : {}),
    ...(query.status ? { status: query.status as ReviewStatus } : {}),
  };

  const [total, reviews] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true } },
        product: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  return {
    data: reviews,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getReviewById(id: string) {
  const review = await prisma.review.findFirst({
    where: { id, isDeleted: false },
    include: {
      user: { select: { id: true, name: true, username: true, avatar: true } },
      product: { select: { id: true, title: true, slug: true } },
    },
  });
  if (!review) throw ApiError.notFound("Review not found");
  return review;
}

export async function updateReview(
  id: string,
  actorId: string,
  isAdmin: boolean,
  input: UpdateReviewInput
) {
  const existing = await prisma.review.findFirst({
    where: { id, isDeleted: false },
  });
  if (!existing) throw ApiError.notFound("Review not found");
  if (!isAdmin && existing.userId !== actorId) {
    throw ApiError.forbidden("You can only update your own reviews");
  }

  const data: Prisma.ReviewUpdateInput = {
    ...input,
    status: ReviewStatus.PENDING,
  };
  return prisma.review.update({ where: { id }, data });
}

export async function updateReviewStatus(id: string, status: string) {
  await getReviewById(id);
  return prisma.review.update({
    where: { id },
    data: { status: status as ReviewStatus },
  });
}

export async function softDeleteReview(
  id: string,
  actorId: string,
  isAdmin: boolean
) {
  const existing = await prisma.review.findFirst({
    where: { id, isDeleted: false },
  });
  if (!existing) throw ApiError.notFound("Review not found");
  if (!isAdmin && existing.userId !== actorId) {
    throw ApiError.forbidden("You can only delete your own reviews");
  }
  return prisma.review.update({ where: { id }, data: { isDeleted: true } });
}
